package org.cnio.scombio.jmfernandez.widget.exist;
/*
 * José María Fernández González, (C) 2006
 * GNV2, CNIO
 * for bioVapor 0.1
 * 
 * This code is based on the one from EchoFunction.java from
 * eXist v1.1.1
 eXist Open Source Native XML Database
 Copyright (C) 2001-03 Wolfgang M. Meier
 wolfgang@exist-db.org
 http://exist.sourceforge.net
 
 This program is free software; you can redistribute it and/or
 modify it under the terms of the GNU Lesser General Public License
 as published by the Free Software Foundation; either version 2
 of the License, or (at your option) any later version.
 
 This program is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU Lesser General Public License for more details.
 
 You should have received a copy of the GNU Lesser General Public License
 along with this program; if not, write to the Free Software
 Foundation, Inc., 675 Mass Ave, Cambridge, MA 02139, USA.
 
 $Id: EchoFunction.java 3063 2006-04-05 20:49:44Z brihaye $
 */

import java.util.Timer;
import java.util.TimerTask;

import org.cnio.scombio.jmfernandez.widget.EnsemblRefs;
import org.ensembl.driver.AdaptorException;

import org.exist.dom.QName;
import org.exist.xquery.BasicFunction;
import org.exist.xquery.Cardinality;
import org.exist.xquery.FunctionSignature;
import org.exist.xquery.XPathException;
import org.exist.xquery.XQueryContext;
import org.exist.xquery.value.Sequence;
import org.exist.xquery.value.SequenceIterator;
import org.exist.xquery.value.SequenceType;
import org.exist.xquery.value.StringValue;
import org.exist.xquery.value.Type;
import org.exist.xquery.value.ValueSequence;

/**
 * @author Jose Maria Fernandez Gonzalez (jmfernandez@cnio.es)
 */
public class ReferringFunction
	extends BasicFunction
{
	private final static String GETMIMREFS="getmimrefs";
	private final static String FETCHBYEXTERNALREFS="fetchbyexternalrefs";
	private final static String FETCHBYMIMREFS="fetchbymimrefs";
	protected final static long SLEEPTIME=300000;	// 5 minutes
	
	public final static FunctionSignature signature[] = {
		new FunctionSignature(
			new QName(GETMIMREFS, EnsemblModule.NAMESPACE_URI, EnsemblModule.PREFIX),
			"It returns the associated MIM ids to the input EnsEMBL stable identifiers",
			new SequenceType[] { new SequenceType(Type.STRING, Cardinality.ZERO_OR_MORE)},
			new SequenceType(Type.STRING, Cardinality.ZERO_OR_MORE)
		),
		new FunctionSignature(
			new QName(FETCHBYEXTERNALREFS, EnsemblModule.NAMESPACE_URI, EnsemblModule.PREFIX),
			"It returns the EnsEMBL stable identifiers which are associated to the input ids (from any database)",
			new SequenceType[] { new SequenceType(Type.STRING, Cardinality.ZERO_OR_MORE)},
			new SequenceType(Type.STRING, Cardinality.ZERO_OR_MORE)
		),
		new FunctionSignature(
			new QName(FETCHBYMIMREFS, EnsemblModule.NAMESPACE_URI, EnsemblModule.PREFIX),
			"It returns the EnsEMBL stable identifiers which are associated to the input MIM ids",
			new SequenceType[] { new SequenceType(Type.STRING, Cardinality.ZERO_OR_MORE)},
			new SequenceType(Type.STRING, Cardinality.ZERO_OR_MORE)
		),
	};
	
	protected EnsemblRefsController erc;
	protected Timer timer;

	public ReferringFunction(XQueryContext context,FunctionSignature signature)
	{
		super(context, signature);
		erc=new EnsemblRefsController();
		timer=new Timer(true);
		timer.schedule(new EnsemblTimerTask(),SLEEPTIME,SLEEPTIME);
	}

	public Sequence eval(Sequence[] args, Sequence contextSequence)
		throws XPathException
	{
		// is argument the empty sequence?
		if (args[0].isEmpty())
			return Sequence.EMPTY_SEQUENCE;
		
		String functionName = getSignature().getName().getLocalName();
		
		// iterate through the argument sequence and echo each item
		ValueSequence result = new ValueSequence();
		
		// Getting a connection on the first instantiation
		synchronized(erc) {
			EnsemblRefs er=null;
			try {
				er=erc.reconnect();
			} catch(AdaptorException ae) {
				erc.free();
				throw new XPathException(ae.getMessage());
			}
			
			if(GETMIMREFS.equals(functionName)) {
				for (SequenceIterator si = args[0].iterate(); si.hasNext();) {
					String str = si.nextItem().getStringValue();
					String[] gotvals=null;
					try {
						gotvals=er.getMIMRefsForAGene(str);
					} catch(AdaptorException ae) {
						er=null;
						erc.free();
						throw new XPathException(ae.getMessage());
					}

					if(gotvals!=null) {
						for(int gi=0;gi<gotvals.length;gi++) {
							result.add(new StringValue(gotvals[gi]));
						}
					}
				}
			} else {
				String[] sstr=new String[args[0].getLength()];
				int ssi=0;
				for (SequenceIterator si = args[0].iterate(); si.hasNext();ssi++) {
					sstr[ssi] = si.nextItem().getStringValue();
				}

				String[] ggotvals=null;
				try {
					if(FETCHBYEXTERNALREFS.equals(functionName)) {
						ggotvals=er.fetchGenesByExternalRefs(sstr);
					} else if(FETCHBYMIMREFS.equals(functionName)) {
						ggotvals=er.fetchGenesByExternalMIMRefs(sstr);
					}
				} catch(AdaptorException ae) {
					er=null;
					erc.free();
					throw new XPathException(ae.getMessage());
				}

				if(ggotvals!=null) {
					for(int ggi=0;ggi<ggotvals.length;ggi++) {
						result.add(new StringValue(ggotvals[ggi]));
					}
				}
			}
		}
		return result;
	}
	
	public class EnsemblTimerTask
		extends TimerTask
	{
		protected EnsemblTimerTask()
		{
			super();
		}
		
		public void run()
		{
			synchronized(erc) {
				erc.free();
			}
		}
	}
	
	public class EnsemblRefsController
	{
		protected EnsemblRefs er=null;
		
		public void free()
		{
			er=null;
		}
		
		public EnsemblRefs reconnect()
			throws AdaptorException
		{
			if(er==null) {
				er=new EnsemblRefs();
			}
			
			return er;
		}
	}
}
