package org.cnio.scombio.jmfernandez.ORFandDB.filter;

public abstract class Tool {
	protected String name;
	protected StringBuilder description;
	
	public class Tool(String name)
	{
		this.name=name;
		clearDescription();
	}
	
	public String getName()
	{
		return name;
	}
	
	public String getDescription()
	{
		return description.toString();
	}
	
	public void appendToDescription(String newDescription)
	{
		description.append(newDescription);
	}
	
	public void appendToDescription(char[] newDescription)
	{
		description.append(newDescription);
	}
	
	public void appendToDescription(char[] newDescription,int offset,int len)
	{
		description.append(newDescription,offset,len);
	}
	
	public String setDescription(String newDescription)
	{
		String oldDescription=description.toString();
		
		description=new StringBuilder(newDescription);
		
		return oldDescription;
	}
	
	public void setDescription(StringBuilder newDescription)
	{
		description=newDescription;
	}
	
	public void clearDescription()
	{
		description=new StringBuilder();
	}
	
	public abstract getInputDescriptions();
	public abstract getOutputDescriptions();
	
	public abstract InstancedTool createInstance();
}
