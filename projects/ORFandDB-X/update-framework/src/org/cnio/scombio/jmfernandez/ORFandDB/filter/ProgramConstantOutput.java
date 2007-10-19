package org.cnio.scombio.jmfernandez.ORFandDB.filter;

public class ProgramConstantOutput
	extends ProgramOption
{
	protected String filePattern;
	
	public ProgramConstantOutput(String name,boolean isMultiple)
	{
		super(name,false,isMultiple,ProgramOptionType.FILE,ProgramOptionCourse.OUTPUT);
		filePattern = null;
	}
	
	public void setFilePattern(String newFilePattern)
	{
		filePattern = newFilePattern;
	}
	
	// Some validation code is going to be added here
	// which is going to be called from ProgramOptionSet
}
