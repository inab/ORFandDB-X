package org.cnio.ORFandDB.filter;

import java.util.HashMap;

public class ToolChest
{
	private String name;
	private StringBuilder description;
	private HashMap<String,Tool> toolChest;
	
	public ToolChest(String name)
	{
		if(name==null)
			throw new NullPointerException("ToolChest constructor needs a non-null name!!!");
		this.name=name;
		toolChest=new HashMap<String,Tool>();
		clearDescription();
	}
	
	public ToolChest(String name, ToolChest base)
	{
		this(name);
		addToolChest(base);
	}
	
	public ToolChest(String name,Tool[] base)
	{
		this(name);
		
		for(Tool tool: base) {
			if(tool!=null) {
				addTool(tool);
			}
		}
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
	
	public void setDescription(String newDescription)
	{
		description=new StringBuilder(newDescription);
	}
	
	public void clearDescription()
	{
		description=new StringBuilder();
	}
	
	/**
		This method adds the contents of an
		existing toolchest to the current one
	*/
	public void addToolChest(ToolChest base)
		throws NullPointerException
	{
		if(base==null)
			throw new NullPointerException("addToolChest needs a base non-null ToolChest!!!");
		
		toolChest.putAll(base.toolChest);
	}
	
	/**
		A tool is added to the toolchest.
		If a tool with the same name is already inside,
		an exception is fired.
	*/
	public void addTool(Tool t)
		throws NullPointerException,ToolChestException
	{
		if(t==null)
			throw new NullPointerException("addTool needs a non-null Tool!!!");
		
		String toolName=t.getName();
		
		if(toolName==null)
			throw new ToolChestException("addTool needs that the input Tool has a non-null name!!!");
		
		if(toolChest.containsKey(toolName))
			throw new ToolChestException("This toolchest already contains a tool with the name '"+toolName+"'");
		
		toolChest.put(toolName,tool);
	}
	
	/**
		A tool is added to the toolchest.
		If a tool with the same name is already inside,
		the tool is replaced. The replaced tool is
		returned, when available.
	*/
	public Tool addOrReplaceTool(Tool t)
		throws NullPointerException,ToolChestException
	{
		if(t==null)
			throw new NullPointerException("addOrReplaceTool needs a non-null Tool!!!");
		
		String toolName=t.getName();
		
		if(toolName==null)
			throw new ToolChestException("addOrReplaceTool needs that the input Tool has a non-null name!!!");
		
		return toolChest.put(toolName,tool);
	}
	
	/**
		A tool is removed from the toolchest.
		The removed tool is returned.
	*/
	public Tool removeTool(String toolName)
		throws NullPointerException
	{
		if(toolName==null)
			throw new NullPointerException("removeTool needs that the input Tool has a non-null name!!!");
		
		return toolChest.remove(toolName);
	}
	
	/**
		All the tools inside the toolchest
		are discarded.
	*/
	public boolean clear()
	{
		toolChest.clear()
	}
}
