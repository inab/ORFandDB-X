/*
	Copyright (C) 2003 EBI, GRL

	This library is free software; you can redistribute it and/or
	modify it under the terms of the GNU Lesser General Public
	License as published by the Free Software Foundation; either
	version 2.1 of the License, or (at your option) any later version.

	This library is distributed in the hope that it will be useful,
	but WITHOUT ANY WARRANTY; without even the implied warranty of
	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
	Lesser General Public License for more details.

	You should have received a copy of the GNU Lesser General Public
	License along with this library; if not, write to the Free Software
	Foundation, Inc., 59 Temple Place, Suite 330, Boston, MA  02111-1307  USA
*/

package org.ensembl.util;

import java.sql.CallableStatement;
import java.sql.Connection;
import java.sql.DatabaseMetaData;
import java.sql.PreparedStatement;
import java.sql.SQLException;
import java.sql.SQLWarning;
import java.sql.Savepoint;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.Map;
import java.util.logging.Logger;

/**
 * The ConnectionWrapper is a Proxy for an underlying connection
 * and offers additional behaviour relevant for use in a ConnectionPool.
 * 
 * It provides debugging information, causes close() to return the connection
 * to the parent ConnectionPool and closes all statements when the 
 * connection is closed.
 */
public class ConnectionWrapper implements Connection {

	private static final Logger logger =
		Logger.getLogger(ConnectionWrapper.class.getName());

	private Connection conn;
	private ConnectionPoolDataSource pool;

	private ArrayList statements = new ArrayList();
	
	public ConnectionWrapper(Connection conn, ConnectionPoolDataSource pool) {
		this.conn = conn;
		this.pool = pool;
		logger.fine("Creating ConnectionWrapper");
	}

	public void clearWarnings() throws SQLException {
		conn.clearWarnings();
	}

	public void close() throws SQLException {
	  closeAndReleaseStatements();
		pool.release(this);
	}

	public void commit() throws SQLException {
		conn.commit();
	}

	public Statement createStatement() throws SQLException {
	  return cacheStatement(conn.createStatement());
	}

	public Statement createStatement(
		int resultSetType,
		int resultSetConcurrency)
		throws SQLException {
		return cacheStatement(conn.createStatement(resultSetType, resultSetConcurrency));
	}

	public Statement createStatement(
		int resultSetType,
		int resultSetConcurrency,
		int resultSetHoldability)
		throws SQLException {
		return cacheStatement(conn.createStatement(
			resultSetType,
			resultSetConcurrency,
			resultSetHoldability));
	}

	public boolean getAutoCommit() throws SQLException {
		return conn.getAutoCommit();
	}

	public String getCatalog() throws SQLException {
		return conn.getCatalog();
	}

	public int getHoldability() throws SQLException {
		return conn.getHoldability();
	}

	public DatabaseMetaData getMetaData() throws SQLException {
		return conn.getMetaData();
	}

	public int getTransactionIsolation() throws SQLException {
		return conn.getTransactionIsolation();
	}

	public Map getTypeMap() throws SQLException {
		return conn.getTypeMap();
	}

	public SQLWarning getWarnings() throws SQLException {
		return conn.getWarnings();
	}

	public boolean isClosed() throws SQLException {
		return conn.isClosed();
	}

	public boolean isReadOnly() throws SQLException {
		return conn.isReadOnly();
	}

	public String nativeSQL(String sql) throws SQLException {
		return conn.nativeSQL(sql);
	}

	public CallableStatement prepareCall(String sql) throws SQLException {
		return conn.prepareCall(sql);
	}

	public CallableStatement prepareCall(
		String sql,
		int resultSetType,
		int resultSetConcurrency)
		throws SQLException {
		return conn.prepareCall(sql, resultSetType, resultSetConcurrency);
	}

	public CallableStatement prepareCall(
		String sql,
		int resultSetType,
		int resultSetConcurrency,
		int resultSetHoldability)
		throws SQLException {
		return conn.prepareCall(
			sql,
			resultSetType,
			resultSetConcurrency,
			resultSetHoldability);
	}

	public PreparedStatement prepareStatement(String sql) throws SQLException {
	  return cachePreparedStatement(conn.prepareStatement(sql));
	}

	public PreparedStatement prepareStatement(
		String sql,
		int autoGeneratedKeys)
		throws SQLException {
	  return cachePreparedStatement(conn.prepareStatement(sql, autoGeneratedKeys));
	}

	public PreparedStatement prepareStatement(
		String sql,
		int resultSetType,
		int resultSetConcurrency)
		throws SQLException {
	  return cachePreparedStatement(conn.prepareStatement(sql, resultSetType, resultSetConcurrency));
	}

	public PreparedStatement prepareStatement(
		String sql,
		int resultSetType,
		int resultSetConcurrency,
		int resultSetHoldability)
		throws SQLException {
		return cachePreparedStatement(conn.prepareStatement(
			sql,
			resultSetType,
			resultSetConcurrency,
			resultSetHoldability));
	}

	public PreparedStatement prepareStatement(String sql, int[] columnIndexes)
		throws SQLException {
		return cachePreparedStatement(conn.prepareStatement(sql, columnIndexes));
	}

	public PreparedStatement prepareStatement(String sql, String[] columnNames)
		throws SQLException {
		return cachePreparedStatement(conn.prepareStatement(sql, columnNames));
	}

	private PreparedStatement cachePreparedStatement(PreparedStatement ps) {
	  statements.add(ps);
	  return ps;
	}
	
	private Statement cacheStatement(Statement s) {
	  statements.add(s);
	  return s;
	}
	
	public void releaseSavepoint(Savepoint savepoint) throws SQLException {
		conn.releaseSavepoint(savepoint);
	}

	public void rollback() throws SQLException {
		conn.rollback();
	}

	public void rollback(Savepoint savepoint) throws SQLException {
		conn.rollback(savepoint);
	}

	public void setAutoCommit(boolean autoCommit) throws SQLException {
		if (conn.getAutoCommit() != autoCommit) {
			conn.setAutoCommit(autoCommit);
		}
	}

	public void setCatalog(String catalog) throws SQLException {
		conn.setCatalog(catalog);
	}

	public void setHoldability(int holdability) throws SQLException {
		conn.setHoldability(holdability);
	}

	public void setReadOnly(boolean readOnly) throws SQLException {
		conn.setReadOnly(readOnly);
	}

	public Savepoint setSavepoint() throws SQLException {
		return conn.setSavepoint();
	}

	public Savepoint setSavepoint(String name) throws SQLException {
		return conn.setSavepoint(name);
	}

	public void setTransactionIsolation(int level) throws SQLException {
		conn.setTransactionIsolation(level);
	}

	public void setTypeMap(Map map) throws SQLException {
		conn.setTypeMap(map);
	}

	public String toString() {
		return conn.toString();
	}

	/**
	 * Closes the wrapped connection.
	 */
	protected void finalize() throws Throwable {
		closeWrappedConnection();
	}

	/**
	 * Close the wrapped connection.
	 */
	void closeWrappedConnection() throws SQLException {
	  closeAndReleaseStatements();
		if (!conn.isClosed())
			logger.fine("Closing db connection: " + this.getClass().getName() + " [" + this +"]");
		conn.close();
	}

	private synchronized void closeAndReleaseStatements() throws SQLException {
	  final int n = statements.size();
	  for (int i = 0; i < n; i++) 
      ((Statement)statements.get(i)).close();
    statements.clear();
	}
	
}
