/*
	Copyright (C) 2003 EBI, GRL

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

package org.ensembl.variation.datamodel.impl;

import org.ensembl.datamodel.impl.PersistentImpl;
import org.ensembl.driver.AdaptorException;
import org.ensembl.driver.RuntimeAdaptorException;
import org.ensembl.variation.datamodel.Genotype;
import org.ensembl.variation.datamodel.Variation;
import org.ensembl.variation.driver.VariationDriver;

/**
 * Base class for Genotype types.
 *
 * @author <a href="mailto:craig@ebi.ac.uk">Craig Melsopp</a>
 */
public abstract class GenotypeImpl extends PersistentImpl implements Genotype {

  /**
   * Used by the (de)serialization system to determine if the data 
   * in a serialized instance is compatible with this class.
   *
   * It's presence allows for compatible serialized objects to be loaded when
   * the class is compatible with the serialized instance, even if:
   *
   * <ul>
   * <li> the compiler used to compile the "serializing" version of the class
   * differs from the one used to compile the "deserialising" version of the
   * class.</li>
   *
   * <li> the methods of the class changes but the attributes remain the same.</li>
   * </ul>
   *
   * Maintainers must change this value if and only if the new version of
   * this class is not compatible with old versions. e.g. attributes
   * change. See Sun docs for <a
   * href="http://java.sun.com/j2se/1.4.2/docs/guide/serialization/">
   * details. </a>
   *
   */
  private static final long serialVersionUID = 1L;



	protected VariationDriver vdriver;
	
	private String allele1;
	private String allele2;
	private Variation variation;
	private long variationID;
	
	
	
	/**
	 * Constructs Genotype instance with ability to lazy load variation.
	 * @param vdriver parent driver.
	 * @param allele1 allele 1.
	 * @param allele2 allele 2.
	 * @param variationID internal ID of the variation this genotype relates to.
	 */
	public GenotypeImpl(VariationDriver vdriver, String allele1,
			String allele2, long variationID) {
		this.vdriver = vdriver;
		this.allele1 = allele1;
		this.allele2 = allele2;
		this.variationID = variationID;
	}
	/**
	 * @see org.ensembl.variation.datamodel.Genotype#getAllele1()
	 */
	public String getAllele1() {
		return allele1;
	}

	/**
	 * @see org.ensembl.variation.datamodel.Genotype#getAllele2()
	 */
	public String getAllele2() {
		return allele2;
	}

	/**
	 * @see org.ensembl.variation.datamodel.Genotype#getVariation()
	 */
	public Variation getVariation() {
		if (variation==null && variationID>0 && vdriver!=null)
			try {
				variation = vdriver.getVariationAdaptor().fetch(variationID);
			} catch (AdaptorException e) {
				throw new RuntimeAdaptorException("Failed to lazy load variation: " + variationID,e);
			}
		return variation;
	}

}
