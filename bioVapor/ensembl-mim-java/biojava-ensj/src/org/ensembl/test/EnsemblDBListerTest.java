/*
	Copyright (C) 2005 EBI, GRL

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

package org.ensembl.test;

import junit.framework.TestCase;

import org.ensembl.util.EnsemblDBLister;

public class EnsemblDBListerTest extends TestCase {

  public EnsemblDBListerTest(String name) {
    super(name);
  }
  
  public static void main(String[] args) {
    junit.textui.TestRunner.run(EnsemblDBListerTest.class);
  }

  public void testMain() throws Exception {
    // This will usually throw an exception if it fails
    EnsemblDBLister.main(new String[]{});
  }

}
