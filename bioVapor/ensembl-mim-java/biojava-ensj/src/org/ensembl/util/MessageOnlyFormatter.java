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

package org.ensembl.util;

import java.util.logging.Formatter;
import java.util.logging.LogRecord;

/**
 * Custom class for formatting log messages, just prints the log message.
 * 
 * To use this class set
 * java.util.logging.XXXHandler.formatter=org.ensembl.util.LogFormatter in your
 * logging config file or as a JVM (-D) argument.
 * 
 * @author <a href="mailto:craig@ebi.ac.uk">Craig Melsopp </a>
 */
public class MessageOnlyFormatter extends Formatter {

  public String format(LogRecord record) {

    Throwable t = record.getThrown();

    StringBuffer buffer = new StringBuffer();
    buffer.append(record.getMessage());
    if (t != null)
      buffer.append(Util.throwableToStackTraceString(t));
    buffer.append("\n");

    return buffer.toString();
  }
}
