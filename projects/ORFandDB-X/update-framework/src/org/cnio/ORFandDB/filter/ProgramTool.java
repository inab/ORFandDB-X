package org.cnio.ORFandDB.filter;

import java.util.HashMap;

public class ProgramTool
	extends Tool
{
	private String programPath;
	private HashMap<ProgramOptionSet> optionSets;
	
	public ProgramTool(String toolName,String path)
	{
		super(toolName);
		
		programPath=path;
		optionSets=new HashMap<ProgramOptionSet>();
	}
	
	public String getProgramPath()
	{
		return programPath;
	}
	
	public ProgramOptionSet getProgramOptionSet(String optionSetName)
	{
		return optionSets.get(optionSetName);
	}
	
	public void addProgramOptionSet(ProgramOptionSet newPOS)
	{
		optionSets.put(newPOS.getName(),newPOS);
	}
}
