package org.cnio.scombio.jmfernandez.widget;
/*
 * José María Fernández González, (C) 2006
 * GNV2, CNIO
 * for bioVapor 0.1
 * 
 * This code is based on the one from Example.java from
 * EnsEMBL java api
 * 
 Copyright (C) 2001 EBI, GRL

 This library is free software; you can redistribute it and/or
 modify it under the terms of the GNU Lesser General Public
 License as published by the Free Software Foundation; either
 version 2.1 of the License, or (at your option) any later version.

 This library is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 Lesser General Public License for more details.

 You should have received a copy of the GNU Lesser General Public
 License along with this library; if not, write to the Free Software
 Foundation, Inc., 59 Temple Place, Suite 330, Boston, MA  02111-1307  USA
 */


import java.util.ArrayList;
import java.util.List;

import org.ensembl.datamodel.ExternalDatabase;
import org.ensembl.datamodel.ExternalRef;
import org.ensembl.datamodel.Gene;
import org.ensembl.driver.AdaptorException;
import org.ensembl.driver.CoreDriver;
import org.ensembl.driver.CoreDriverFactory;
import org.ensembl.driver.GeneAdaptor;

/**
 * Example code demonstrating how to retrieve data from ensembl databases
 * using ensj.
 * 
 * The examples below retrieve data from the latest human core and variation databases on 
 * ensembldb.ensembl.org
 * 
 * @author Craig Melsopp
 * @see <a href="Example.java.html">Example.java</a> source <a href="Example.java">(txt)</a>
 * 
 */

public class EnsemblRefs {
	protected final static String[] MIMDBNAME={
		"MIM_GENE",
		"MIM_MORBID",
	};
	
	protected CoreDriver coreDriver;
	protected GeneAdaptor geneAdaptor; 

	/**
	 * Creates an instance of Example with core and varition drivers configured.
	 * 
	 * @throws AdaptorException
	 */
	public EnsemblRefs()
		throws AdaptorException
	{

		// We need core and variation drivers that point to the latest human databases
		// on ensembldb.ensmbl.org. The easiest way to get these is from the default registry.
		// See org.ensembl.registry.Registry for more information.
		coreDriver = CoreDriverFactory.createCoreDriver("resources/bioVapor.properties");
		geneAdaptor = coreDriver.getGeneAdaptor();
//		Registry dr = Registry.createDefaultUserRegistry();
//		coreDriver = dr.getGroup("human").getCoreDriver();
//		variationDriver = dr.getGroup("human").getVariationDriver();

		// Another approach is to use custom configuration files which can point to
		// any ensembl databases.
		//coreDriver = CoreDriverFactory.createCoreDriver("resources/data/example_core_database.properties");
		//variationDriver = VariationDriverFactory.createVariationDriver("resources/data/example_variation_database.properties");
		// the variation driver needs a sister core driver to access the core database
		//variationDriver.setCoreDriver(coreDriver);


		// A third way is to use the user default registry. See org.ensembl.registry.Registry
		// for more information.
	}

	/**
	 * Convenience method to translate from ArrayList to String array
	 * @param idfromext
	 * Input ArrayList, which should contain String objects
	 * @return
	 * An String array with the same elements as the input ArrayList
	 */
	protected String[] fromArrayListToStringArray(ArrayList idfromext)
	{
		String[] salida=new String[idfromext.size()];
		
		for(int isal=0;isal<salida.length;isal++) {
			salida[isal]=(String)idfromext.get(isal);
		}
		
		return salida;
	}

	/**
	 * 
	 * @param xrefs
	 * @return
	 * @throws AdaptorException
	 */
	protected ArrayList internalFetchGenesByExternalRefs(String[] xrefs)
		throws AdaptorException
	{
		// 1553569_at is an affymetrix probeset name
		// HAA0 is a HUGO identifier
		// String[] xrefs = new String[] { "1553569_at", "HAAO" };
		
		ArrayList idfromext=new ArrayList();
		
		for (int i = 0; i < xrefs.length; i++) {
			List genes = geneAdaptor.fetchBySynonym(xrefs[i]);
			for (int j = 0; j < genes.size(); j++) {
				String geneAccession = ((Gene) genes.get(j)).getAccessionID();
				idfromext.add(geneAccession);
			}
		}
		
		return idfromext;
	}
	
	/**
	 * 
	 * @param gene
	 * @param dblist
	 * @return
	 * @throws AdaptorException
	 */
	public ArrayList internalGetExternalRefsForAGene(Gene gene,String[] dblist)
		throws AdaptorException
	{
	
		// String geneAccession = "ENSG00000134982";
		// ENSG00000169861
	
		List xrefs = gene.getExternalRefs();
		ArrayList mimList=new ArrayList();
		
		for (int iref = 0, nref = xrefs.size(); iref < nref; iref++) {
			ExternalRef xref = (ExternalRef) xrefs.get(iref);
			ExternalDatabase xdb = xref.getExternalDatabase();
			if(xdb!=null) {
				String dbname=xdb.getName();
				for(int idb = 0;idb<dblist.length;idb++) {
					if(dbname.equals(dblist[idb])) {
						mimList.add(xref.getDisplayID());
						break;
					}
				}
			}
		}
		
		return mimList;
	}
	/**
	 * 
	 * @param xrefs
	 * @return
	 * @throws AdaptorException
	 */
	protected ArrayList internalFetchGenesAndValidateByExternalRefs(String[] xrefs,String[] dbnames)
		throws AdaptorException
	{
		// 1553569_at is an affymetrix probeset name
		// HAA0 is a HUGO identifier
		// String[] xrefs = new String[] { "1553569_at", "HAAO" };
		
		ArrayList idfromext=new ArrayList();
		
		for (int i = 0; i < xrefs.length; i++) {
			List genes = geneAdaptor.fetchBySynonym(xrefs[i]);
			for (int j = 0; j < genes.size(); j++) {
				Gene g=(Gene) genes.get(j);
				ArrayList erefs=internalGetExternalRefsForAGene(g,dbnames);
				for(int iref=0,nref=erefs.size();iref<nref;iref++) {
					if(xrefs[i].equals(erefs.get(iref))) {
						String geneAccession = g.getAccessionID();
						idfromext.add(geneAccession);
						break;
					}
				}
			}
		}
		
		return idfromext;
	}

	/**
	 * Fetch genes corresponding to various external references/identifier such
	 * as HUGO ids and Affymetrix probeset names.
	 * 
	 * @throws AdaptorException
	 */
	public String[] fetchGenesByExternalRefs(String[] xrefs)
		throws AdaptorException
	{
		return fromArrayListToStringArray(internalFetchGenesByExternalRefs(xrefs));
	}
	
	/**
	 * 
	 * @param xrefs
	 * @return
	 * @throws AdaptorException
	 */
	public String[] fetchGenesByExternalMIMRefs(String[] xrefs)
		throws AdaptorException
	{
		return fetchGenesAndValidateByExternalRefs(xrefs,MIMDBNAME);
	}
	
	/**
	 * 
	 * @param xrefs
	 * @param dbnames
	 * @return
	 * @throws AdaptorException
	 */
	public String[] fetchGenesAndValidateByExternalRefs(String[] xrefs,String[] dbnames)
		throws AdaptorException
	{
		return fromArrayListToStringArray(internalFetchGenesAndValidateByExternalRefs(xrefs,dbnames));
	}
	
	/**
	 * Fetches a gene from the database and returns an
	 * string array with its references to OMIM
	 * @param geneAccession
	 * An stable EnsEMBL id
	 * @return
	 * A string array with the found references, which belong to
	 * OMIM. If nothing is found, it returns null
	 * @throws AdaptorException
	 * When a connection problem arises, this exception is fired
	 */
	public String[] getMIMRefsForAGene(String geneAccession)
		throws AdaptorException
	{
		return getExternalRefsForAGene(geneAccession,MIMDBNAME);
	}

		/**
	 * Fetches a gene from the database and returns an
	 * string array with its references to the input databases
	 * @param geneAccession
	 * An stable EnsEMBL id
	 * @param dblist
	 * A string array with the databases we want to reference
	 * @return
	 * A string array with the found references, which belong to
	 * the input databases in dblist. If nothing is found, it
	 * returns null
	 * @throws AdaptorException
	 * When a connection problem arises, this exception is fired
	 */
	public String[] getExternalRefsForAGene(String geneAccession,String[] dblist)
		throws AdaptorException
	{

		// String geneAccession = "ENSG00000134982";
		// ENSG00000169861

		String[] mimRefs=null;
		Gene gene = geneAdaptor.fetch(geneAccession);
		if(gene!=null) {
			mimRefs=fromArrayListToStringArray(internalGetExternalRefsForAGene(gene,dblist));
		}
		
		return mimRefs;
	}

}
