package org.cnio.scombio.jmfernandez.ORFandDB.filter;

import java.util.Stack;
import org.xml.sax.ContentHandler;
import org.xml.sax.SAXException;

public class ToolChestReader
	implements ContentHandler
{
	public final static String TOOLCHEST_TAG="toolchest";
	public final static String DESCRIPTION_TAG="description";
	
	protected Stack<ToolChest> activeToolChest;
	protected boolean waitDesc;
	protected boolean getDescription;
	
	public ToolChestReader() {
		reset();
	}
	
	public void reset()
	{
		activeToolChest.clear();
		waitDesc=false;
		getDescription=false;
	}
	
	public ToolChest getActiveToolChest()
	{
		return activeToolChest.peek();
	}
	
	void setDocumentLocator(Locator locator)
	{
		// DoNothing(R)
	}

	void startDocument()
		throws SAXException
	{
		// DoNothing(R)
	}

	void endDocument()
		throws SAXException
	{
		// DoNothing(R)
	}

	void startPrefixMapping(String prefix,String uri)
		throws SAXException
	{
		// DoNothing(R)
	}

	void endPrefixMapping(String prefix)
		throws SAXException
	{
		// DoNothing(R)
	}

	void startElement(String uri,String localName,String qName,Attributes atts)
		throws SAXException
	{
		if(UpdateFrameworkReader.FilterNS.equals(uri)
			&& TOOLCHEST_TAG.equals(localName))
		{
			try {
				ToolChest newToolChest=new ToolChest(atts.getValue("name"));
				activeToolChest.push(newToolChest);
			} catch(NullPointerException npe) {
				throw new SAXException(npe);
			}
			waitDesc=true;
		} else {
			if(waitDesc && UpdateFrameworkReader.FilterNS.equals(uri)
				&& DESCRIPTION_TAG.equals(localName))) {
				getDescription=true;
			}
			waitDesc=false;
		}
	}

	void endElement(String uri,String localName,String qName)
		throws SAXException
	{
		if(UpdateFrameworkReader.FilterNS.equals(uri)
			&& TOOLCHEST_TAG.equals(localName))
		{
			activeToolChest.pop();
		} else {
			if(getDescription && UpdateFrameworkReader.FilterNS.equals(uri)
				&& DESCRIPTION_TAG.equals(localName))) {
				getDescription=false;
			} else {
				waitDesc=false;
			}
		}
	}

	void characters(char[] ch,int start,int length)
	        throws SAXException
	{
		if(getDescription) {
			activeToolChest.peek().appendToDescription(ch,start,length);
		}
	}

	void ignorableWhitespace(char[] ch,int start,int length)
		throws SAXException
	{
		// DoNothing(R)
	}

	void processingInstruction(String target,String data)
		throws SAXException
	{
		// DoNothing(R)
	}

	void skippedEntity(String name)
		throws SAXException
	{
		// DoNothing(R)
	}
}
