package org.cnio.ORFandDB.filter;

import java.util.HashSet;

public class ProgramSwitch
	extends ProgramOption
{
	protected HashSet<String> switchSet;
	
	public ProgramSwitch(String name,boolean isOptional,boolean isMultiple,ProgramOptionType type,ProgramOptionCourse course)
	{
		super(name,isOptional,isMultiple,type,course);
		switchSet=new HashSet<String>();
	}
	
	public void addSwitchOption(String switchOption)
	{
		switchSet.add(switchOption);
	}
	
	// Some validation code is going to be added here
	// which is going to be called from ProgramOptionSet
}
