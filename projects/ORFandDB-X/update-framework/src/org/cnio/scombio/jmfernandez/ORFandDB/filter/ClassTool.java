package org.cnio.scombio.jmfernandez.ORFandDB.filter;

import java.io.File;
import java.net.URL;
import java.net.URLClassLoader;
import java.util.ArrayList;

public class ClassTool
	extends Tool
{
	protected String classNameToUse;
	protected ArrayList<URL> jarlist;
	protected ClassLoader parentClassLoader;
	
	public ClassTool(String toolName,String className,ClassLoader parentClassLoader)
	{
		super(toolName);
		classNameToUse=className;
		jarlist=new ArrayList<URL>();
		this.parentClassLoader=parentClassLoader;
	}
	
	public ClassTool(String toolName,String className)
	{
		ClassLoader parent=Thread.currentThread().getContextClassLoader();
		
        	if (parent == null)
        		parent = ClassTool.class.getClassLoader();

        	if (parent == null)
        		parent = ClassLoader.getSystemClassLoader();
		
		this(toolName,className,parent);
	}
	
	public void addLibrary(String libpath)
		throws NullPointerException
	{
		if(libpath==null)
			throw new NullPointerException("addLibrary needs a non-null libpath!!!");
		
		URL libpathURL;
		if(libpath.indexOf("http:")==0 ||
			libpath.indexOf("https:")==0 ||
			libpath.indexOf("ftp:")==0) {
			
			libpathURL=new URL(libpath);
		} else {
			libpathURL=(new File(libpath)).toURL();
		}
		
		addLibraryURL(libpathURL);
	}
	
	public void addLibrayURL(URL url)
	{
		jarlist.add(url);
	}
	
	public InstancedTool createInstance()
	{
		URL[] patternURLArray={};
		
		ClassLoader callClassLoader=(jarlist.size()!=0)?new URLClassLoader(jarlist.toArray(patternURLArray),parentClassLoader):parentClassLoader;
	}
}
