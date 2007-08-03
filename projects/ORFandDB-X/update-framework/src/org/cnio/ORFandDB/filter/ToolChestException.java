package org.cnio.ORFandDB.filter;

import java.lang.Exception;

public class ToolChestException
	extends Exception
{
	public ToolChestException()
	{
		super();
	}
	
	public ToolChestException(String message)
	{
		super(message);
	}
	
	public ToolChestException(String message, Throwable cause)
	{
		super(message,cause);
	}
	
	public ToolChestException(Throwable cause)
	{
		super(cause);
	}
}
