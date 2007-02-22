$Id$

README.txt
==========

Xalan is a command line program from Xalan-C package. This package requires both Xerces-C and
Xalan-C. C XLST tools have better performance than Java ones, but even they have their own
limits, because *all* XSLT tools store XML content in memory, and they use a multiple of the XML
content (4 times for C, 100 times for Java). In the general case it must be done so because XSLT
parsers can't know when a XML subtree is not needed any more, or in other words, when a XML subtree
is independent from others. In bioinformatics case, almost all databases distributed in XML format
have an internal record structure, where each record is independent from the others.

This parser is a layer over Xalan, and it is able to split too big inputs in smaller XML conformant
slices, based on some knowledge about the formats. Also, it is able to join generated output slices
onto a unified output, so the slicing and joining process should be transparent enough to the end
user, with the big profit of using less memory (and less time, with luck) in the whole process.

These XML files can be dissected in three sections: a header, a body full of registers and a footer.
The header and footer are always the same (or almost the same) along the files belonging to the
database. The registers are always delimited by the same tags. So, this program needs two tips to
identify the different sections.

*	First, it needs the name of the tag which wraps a register's information, so it is able to
detect when the header has finished and the first register has been found. It is also used to count
the number of registers, and take some split decissions based on the number of registers or the
number of bytes, for instance.

*	Second, it needs the name of the XML tag just next to the last register in the file.

As a bonus, this program should work as usual when 
