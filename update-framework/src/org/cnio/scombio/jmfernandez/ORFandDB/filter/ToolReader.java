package org.cnio.scombio.jmfernandez.ORFandDB.filter;

import java.util.Stack;
import org.xml.sax.ContentHandler;
import org.xml.sax.SAXException;

public class ToolReader
	implements ContentHandler
{
	public final static String TOOL_TAG="tool";
	public final static String DESCRIPTION_TAG="description";
	
	protected String activeTool;
	protected StringBuilder activeDescription;
	protected boolean waitDesc;
	protected boolean getDescription;
	protected ToolChestReader tsr;
	
	public ToolReader(ToolChestReader tsr) {
		this.tsr=tsr;
		reset();
	}
	
	public void reset()
	{
		activeTool=null;
		activeDescription=new StringBuilder();
		getDescription=false;
		waitDesc=false;
	}
	
	public String getActiveTool()
	{
		return activeTool;
	}
	
	public StringBuilder getActiveDescription()
	{
		return activeDescription;
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
			&& TOOL_TAG.equals(localName))
		{
			activeTool=atts.getValue("name");
			waitDesc=true;
		} else {
			if(waitDesc && UpdateFrameworkReader.FilterNS.equals(uri)
				&& DESCRIPTION_TAG.equals(localName))) {
				getDescription=true;
				activeDescription=new StringBuilder();
			}
			waitDesc=false;
		}
	}

	void endElement(String uri,String localName,String qName)
		throws SAXException
	{
		if(UpdateFrameworkReader.FilterNS.equals(uri)
			&& TOOL_TAG.equals(localName))
		{
			activeTool=null;
			activeDescription=new StringBuilder();
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
			activeDescription.append(ch,start,length);
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
