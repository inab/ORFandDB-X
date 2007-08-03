package org.cnio.ORFandDB.filter;

public class ProgramParamBasedOutput
	extends ProgramOption
{
	protected ProgramParam basedParam;
	protected String prefix;
	protected String postfix;
	
	public ProgramParamBasedOutput(String name,boolean isMultiple)
	{
		super(name,true,isMultiple,ProgramOptionType.FILE,ProgramOptionCourse.OUTPUT);
		basedParam = null;
		prefix = null;
		postfix = null;
	}
	
	public void setBasedParam(ProgramParam newBasedParam,String newPrefix,String newPostfix)
	{
		basedParam = newBasedParam;
		prefix = newPrefix;
		postfix = newPostfix;
		// This program param based output is as optional
		// as the program param it depends on
		isOptional = newBasedParam.isOptional;
		newBasedParam.registerBasedParam(this);
	}
	
	// Some validation code is going to be added here
	// which is going to be called from ProgramOptionSet
}
