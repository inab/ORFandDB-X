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
package org.ensembl.compara.driver;

import java.util.List;

import org.ensembl.compara.datamodel.Member;
import org.ensembl.datamodel.Location;
import org.ensembl.driver.Adaptor;
import org.ensembl.driver.AdaptorException;

/**
 * I am associated with the compara-analyses
**/
public interface MemberAdaptor  extends Adaptor
{
    Member fetch( long internalID ) throws AdaptorException;
    
    /**
     * Fetches gene-level homology feature pairs given locations on two chromosomes.
    **/
    List fetch(
      String querySpeciesName,
      Location queryLocation, 
      String hitSpeciesName,
      Location hitLocation 
    ) throws AdaptorException;
    
    /**
     * Fetches gene-level homology feature pairs given location on one chromosomes.
    **/
    List fetch(
      String querySpeciesName,
      Location queryLocation,
      String hitSpeciesName
    ) throws AdaptorException;
    
    /**
     * Fetches gene-level homology feature pairs given an input list of stableids
    **/
    List fetch(
      String querySpeciesName,
      String[] stableIds,
      String hitSpeciesName
    ) throws AdaptorException;
    
    /**
     * Fetches chromosome-level homology feature pairs for query species, query chromosome
     * and target species.
    **/
    List fetch(
      String species1, 
      String species2, 
      String chromosome
    )throws AdaptorException;

  static final String TYPE = "member";

}//end RepeatFeatureAdaptor
