package org.cnio.scombio.jmfernandez.widget.exist;
/*
 * José María Fernández González, (C) 2006
 * GNV2, CNIO
 * for bioVapor 0.1
 * 
 * This code is based on the one from ExampleModule.java from
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
 
 $Id: ExampleModule.java 1173 2005-04-20 11:15:18Z wolfgang_m $
 */

import org.exist.xquery.AbstractInternalModule;
import org.exist.xquery.FunctionDef;

/**
 * @author Jose Maria Fernandez Gonzalez (jmfernandez@cnio.es)
 */
public class EnsemblModule
	extends AbstractInternalModule
{
	public final static String NAMESPACE_URI = "http://www.cnio.es/scombio/jmfernandez/widget/ensembl";
	
	public final static String PREFIX = "ensembl";
	
	private static FunctionDef[] functions;
	
	static {
		functions=new FunctionDef[ReferringFunction.signature.length];
		for(int i=0;i<ReferringFunction.signature.length;i++) {
			functions[i]=new FunctionDef(ReferringFunction.signature[i], ReferringFunction.class);
		}
	};
	
	public EnsemblModule() {
		super(functions);
	}

	public String getNamespaceURI() {
		return NAMESPACE_URI;
	}

	public String getDefaultPrefix() {
		return PREFIX;
	}

	public String getDescription() {
		return "EnsEMBL module which allows relating db identifiers from different databases to EnsEMBL ones, and vice-versa";
	}
}
