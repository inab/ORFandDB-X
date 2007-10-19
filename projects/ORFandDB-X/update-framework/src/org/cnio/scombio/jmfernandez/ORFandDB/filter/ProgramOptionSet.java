package org.cnio.scombio.jmfernandez.ORFandDB.filter;

import java.util.HashMap;

public class ProgramOptionSet
{
	protected String name;
	protected HashMap<ProgramOption> options;
	
	public ProgramOptionSet(String name)
	{
		this.name=name;
		this.options=new HashMap<ProgramOption>;
	}
	
	public String getName()
	{
		return name;
	}
	
	public ProgramOption getOption(String optionName)
	{
		return options.get(optionName);
	}
	
	public void addOption(ProgramOption newOption)
	{
		options.put(newOption.getName(),newOption);
	}
	
	// Some validation code is going to be added here
}
