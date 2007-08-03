package org.cnio.ORFandDB.filter;

import java.util.ArrayList;

public class ProgramParam
	extends ProgramOption
{
	protected String prefix;
	protected String postfix;
	protected boolean isPrefixJoin;
	protected boolean isPostfixJoin;
	
	protected ArrayList<ProgramParamBasedOutput> bpl;
	
	public ProgramParam(String name,boolean isOptional,boolean isMultiple,ProgramOptionType type,ProgramOptionCourse course)
	{
		super(name,isOptional,isMultiple,type,course);
		prefix = null;
		postfix = null;
		isPrefixJoin = false;
		isPostfixJoin = false;
		bpl = new ArrayList<ProgramParamBasedOutput>();
	}
	
	public void setPrefix(String newPrefix,boolean newIsPrefixJoin)
	{
		prefix=newPrefix;
		isPrefixJoin=newIsPrefixJoin;
	}
	
	public void setPostfix(String newPostfix,boolean newIsPostfixJoin)
	{
		postfix=newPostfix;
		isPostfixJoin=newIsPostfixJoin;
	}
	
	public void registerBasedParam(ProgramParamBasedOutput pbo)
	{
		bpl.add(pbo);
	}
	
	// Some validation code is going to be added here
	// which is going to be called from ProgramOptionSet
}
