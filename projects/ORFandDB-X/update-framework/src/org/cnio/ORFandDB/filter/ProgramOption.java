package org.cnio.ORFandDB.filter;

import java.io.File;

public abstract class ProgramOption
{
	protected String name;
	protected ProgramOptionCourse course;
	protected ProgramOptionType type;
	protected boolean isMultiple;
	protected boolean isOptional;
	
	protected String defaultValue;
	protected File defaultFile;
	
	public ProgramOption(String name,boolean isOptional,boolean isMultiple,ProgramOptionType type,ProgramOptionCourse course)
	{
		this.name=name;
		this.isOptional=isOptional;
		this.isMultiple=isMultiple;
		this.type=type;
		this.course=course;
		// The default storage alternatives
		this.defaultValue=null;
		this.defaultFile=null;
	}
	
	public String getName()
	{
		return name;
	}
	
	public boolean isOptional()
	{
		return isOptional;
	}
	
	public boolean isMultiple()
	{
		return isMultiple;
	}
	
	public ProgramOptionType getOptionType()
	{
		return type;
	}
	
	public ProgramOptionCourse getOptionCourse()
	{
		return course;
	}
	
	public Object getDefault()
	{
		if(type==ProgramOptionType.VALUE) {
			return defaultValue;
		} else {
			return defaultFile;
		}
	}
	
	public Object setDefault(String default)
	{
		if(type==ProgramOptionType.VALUE) {
			defaultValue=default;
		} else {
			defaultFile=new File(default);
		}
	}
	
	// Getting the default value should be implemented by each
	// class, changing its behavior according to its nature.
	
	// Some validation code is going to be added here
	// which is going to be called from ProgramOptionSet
	// An abstract method will be added for it.
}
