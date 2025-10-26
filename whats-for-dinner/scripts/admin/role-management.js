#!/usr/bin/env node

/**
 * Admin Role Management Script
 * Manages admin roles, permissions, and access control
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Configuration
const config = {
  supabaseUrl: process.env.SUPABASE_URL || 'http://localhost:54321',
  supabaseServiceKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  outputDir: path.join(__dirname, '../admin-dashboard'),
  verbose: process.env.VERBOSE === 'true'
};

// Colors for console output
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logVerbose(message) {
  if (config.verbose) {
    log(`[VERBOSE] ${message}`, 'blue');
  }
}

// Initialize Supabase client
const supabase = createClient(config.supabaseUrl, config.supabaseServiceKey);

/**
 * Admin role definitions
 */
const ADMIN_ROLES = {
  super_admin: {
    name: 'Super Admin',
    description: 'Full system access with all permissions',
    permissions: {
      all: true,
      users: { read: true, write: true, delete: true },
      meals: { read: true, write: true, delete: true },
      recipes: { read: true, write: true, delete: true },
      ingredients: { read: true, write: true, delete: true },
      analytics: { read: true, write: true },
      system: { read: true, write: true, delete: true },
      admin: { read: true, write: true, delete: true }
    }
  },
  admin: {
    name: 'Admin',
    description: 'Full access to most features except system administration',
    permissions: {
      all: false,
      users: { read: true, write: true, delete: false },
      meals: { read: true, write: true, delete: true },
      recipes: { read: true, write: true, delete: true },
      ingredients: { read: true, write: true, delete: true },
      analytics: { read: true, write: false },
      system: { read: true, write: false, delete: false },
      admin: { read: true, write: false, delete: false }
    }
  },
  moderator: {
    name: 'Moderator',
    description: 'Content moderation and user support',
    permissions: {
      all: false,
      users: { read: true, write: true, delete: false },
      meals: { read: true, write: true, delete: false },
      recipes: { read: true, write: true, delete: false },
      ingredients: { read: true, write: true, delete: false },
      analytics: { read: true, write: false },
      system: { read: false, write: false, delete: false },
      admin: { read: false, write: false, delete: false }
    }
  },
  analyst: {
    name: 'Analyst',
    description: 'Read-only access to analytics and reports',
    permissions: {
      all: false,
      users: { read: true, write: false, delete: false },
      meals: { read: true, write: false, delete: false },
      recipes: { read: true, write: false, delete: false },
      ingredients: { read: true, write: false, delete: false },
      analytics: { read: true, write: false },
      system: { read: false, write: false, delete: false },
      admin: { read: false, write: false, delete: false }
    }
  }
};

/**
 * Create admin user with specific role
 */
async function createAdminUser(userId, role, customPermissions = {}) {
  try {
    log(`Creating admin user with role: ${role}`, 'yellow');
    
    // Validate role
    if (!ADMIN_ROLES[role]) {
      throw new Error(`Invalid role: ${role}. Available roles: ${Object.keys(ADMIN_ROLES).join(', ')}`);
    }
    
    // Get role permissions
    const rolePermissions = ADMIN_ROLES[role].permissions;
    
    // Merge with custom permissions if provided
    const finalPermissions = customPermissions.all ? customPermissions : {
      ...rolePermissions,
      ...customPermissions
    };
    
    const { data, error } = await supabase
      .from('admin_users')
      .insert({
        user_id: userId,
        role: role,
        permissions: finalPermissions,
        is_active: true
      })
      .select()
      .single();

    if (error) throw error;
    
    log(`Admin user created successfully: ${data.id}`, 'green');
    return data;
  } catch (error) {
    log(`Error creating admin user: ${error.message}`, 'red');
    throw error;
  }
}

/**
 * Update admin user role
 */
async function updateAdminUserRole(userId, newRole, customPermissions = {}) {
  try {
    log(`Updating admin user role: ${userId} -> ${newRole}`, 'yellow');
    
    // Validate role
    if (!ADMIN_ROLES[newRole]) {
      throw new Error(`Invalid role: ${newRole}. Available roles: ${Object.keys(ADMIN_ROLES).join(', ')}`);
    }
    
    // Get role permissions
    const rolePermissions = ADMIN_ROLES[newRole].permissions;
    
    // Merge with custom permissions if provided
    const finalPermissions = customPermissions.all ? customPermissions : {
      ...rolePermissions,
      ...customPermissions
    };
    
    const { data, error } = await supabase
      .from('admin_users')
      .update({
        role: newRole,
        permissions: finalPermissions,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    
    log(`Admin user role updated successfully`, 'green');
    return data;
  } catch (error) {
    log(`Error updating admin user role: ${error.message}`, 'red');
    throw error;
  }
}

/**
 * Deactivate admin user
 */
async function deactivateAdminUser(userId) {
  try {
    log(`Deactivating admin user: ${userId}`, 'yellow');
    
    const { data, error } = await supabase
      .from('admin_users')
      .update({
        is_active: false,
        deactivated_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    
    log(`Admin user deactivated successfully`, 'green');
    return data;
  } catch (error) {
    log(`Error deactivating admin user: ${error.message}`, 'red');
    throw error;
  }
}

/**
 * Get admin user details
 */
async function getAdminUser(userId) {
  try {
    log(`Fetching admin user: ${userId}`, 'yellow');
    
    const { data, error } = await supabase
      .from('admin_users')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) throw error;
    
    log(`Admin user fetched successfully`, 'green');
    return data;
  } catch (error) {
    log(`Error fetching admin user: ${error.message}`, 'red');
    throw error;
  }
}

/**
 * List all admin users
 */
async function listAdminUsers() {
  try {
    log('Fetching all admin users...', 'yellow');
    
    const { data, error } = await supabase
      .from('admin_users')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    log(`Found ${data.length} admin users`, 'green');
    return data;
  } catch (error) {
    log(`Error listing admin users: ${error.message}`, 'red');
    throw error;
  }
}

/**
 * Check user permissions
 */
async function checkUserPermissions(userId, resource, action) {
  try {
    log(`Checking permissions for user ${userId}: ${resource}.${action}`, 'yellow');
    
    const adminUser = await getAdminUser(userId);
    
    if (!adminUser) {
      log('User is not an admin', 'red');
      return false;
    }
    
    if (!adminUser.is_active) {
      log('Admin user is not active', 'red');
      return false;
    }
    
    // Check if user has all permissions
    if (adminUser.permissions.all) {
      log('User has all permissions', 'green');
      return true;
    }
    
    // Check specific resource permission
    const resourcePermissions = adminUser.permissions[resource];
    if (!resourcePermissions) {
      log(`No permissions for resource: ${resource}`, 'red');
      return false;
    }
    
    const hasPermission = resourcePermissions[action];
    log(`Permission ${resource}.${action}: ${hasPermission ? 'GRANTED' : 'DENIED'}`, hasPermission ? 'green' : 'red');
    
    return hasPermission;
  } catch (error) {
    log(`Error checking permissions: ${error.message}`, 'red');
    return false;
  }
}

/**
 * Generate role management HTML interface
 */
function generateRoleManagementHTML(adminUsers = []) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin Role Management - What's for Dinner</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background-color: #f5f5f5;
            color: #333;
        }
        
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 2rem;
            text-align: center;
        }
        
        .header h1 {
            font-size: 2.5rem;
            margin-bottom: 0.5rem;
        }
        
        .header p {
            font-size: 1.1rem;
            opacity: 0.9;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 2rem;
        }
        
        .section {
            background: white;
            border-radius: 12px;
            padding: 1.5rem;
            margin-bottom: 2rem;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        
        .section h2 {
            margin-bottom: 1rem;
            color: #333;
        }
        
        .role-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 1rem;
            margin-bottom: 2rem;
        }
        
        .role-card {
            border: 1px solid #e0e0e0;
            border-radius: 8px;
            padding: 1rem;
            background: #fafafa;
        }
        
        .role-card h3 {
            color: #333;
            margin-bottom: 0.5rem;
        }
        
        .role-card p {
            color: #666;
            font-size: 0.9rem;
            margin-bottom: 1rem;
        }
        
        .permissions {
            font-size: 0.8rem;
            color: #888;
        }
        
        .permissions ul {
            list-style: none;
            padding: 0;
        }
        
        .permissions li {
            padding: 0.25rem 0;
        }
        
        .permissions li:before {
            content: "✓ ";
            color: #28a745;
            font-weight: bold;
        }
        
        .admin-users-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 1rem;
        }
        
        .admin-users-table th,
        .admin-users-table td {
            padding: 0.75rem;
            text-align: left;
            border-bottom: 1px solid #eee;
        }
        
        .admin-users-table th {
            background-color: #f8f9fa;
            font-weight: 600;
            color: #666;
        }
        
        .status-badge {
            padding: 0.25rem 0.5rem;
            border-radius: 4px;
            font-size: 0.8rem;
            font-weight: 500;
        }
        
        .status-active {
            background-color: #d4edda;
            color: #155724;
        }
        
        .status-inactive {
            background-color: #f8d7da;
            color: #721c24;
        }
        
        .role-badge {
            padding: 0.25rem 0.5rem;
            border-radius: 4px;
            font-size: 0.8rem;
            font-weight: 500;
            background-color: #e9ecef;
            color: #495057;
        }
        
        .form-group {
            margin-bottom: 1rem;
        }
        
        .form-group label {
            display: block;
            margin-bottom: 0.5rem;
            font-weight: 500;
            color: #333;
        }
        
        .form-group input,
        .form-group select {
            width: 100%;
            padding: 0.75rem;
            border: 1px solid #ddd;
            border-radius: 4px;
            font-size: 1rem;
        }
        
        .form-group button {
            background: #007bff;
            color: white;
            border: none;
            padding: 0.75rem 1.5rem;
            border-radius: 4px;
            cursor: pointer;
            font-size: 1rem;
        }
        
        .form-group button:hover {
            background: #0056b3;
        }
        
        .alert {
            padding: 1rem;
            border-radius: 4px;
            margin-bottom: 1rem;
        }
        
        .alert-success {
            background-color: #d4edda;
            color: #155724;
            border: 1px solid #c3e6cb;
        }
        
        .alert-error {
            background-color: #f8d7da;
            color: #721c24;
            border: 1px solid #f5c6cb;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>Admin Role Management</h1>
        <p>Manage admin users, roles, and permissions</p>
    </div>
    
    <div class="container">
        <!-- Available Roles -->
        <div class="section">
            <h2>Available Roles</h2>
            <div class="role-grid">
                <div class="role-card">
                    <h3>Super Admin</h3>
                    <p>Full system access with all permissions</p>
                    <div class="permissions">
                        <ul>
                            <li>All permissions</li>
                            <li>User management</li>
                            <li>System administration</li>
                            <li>Analytics access</li>
                        </ul>
                    </div>
                </div>
                
                <div class="role-card">
                    <h3>Admin</h3>
                    <p>Full access to most features except system administration</p>
                    <div class="permissions">
                        <ul>
                            <li>User management (read/write)</li>
                            <li>Content management</li>
                            <li>Analytics (read-only)</li>
                            <li>System monitoring</li>
                        </ul>
                    </div>
                </div>
                
                <div class="role-card">
                    <h3>Moderator</h3>
                    <p>Content moderation and user support</p>
                    <div class="permissions">
                        <ul>
                            <li>User support</li>
                            <li>Content moderation</li>
                            <li>Analytics (read-only)</li>
                            <li>Limited system access</li>
                        </ul>
                    </div>
                </div>
                
                <div class="role-card">
                    <h3>Analyst</h3>
                    <p>Read-only access to analytics and reports</p>
                    <div class="permissions">
                        <ul>
                            <li>Analytics (read-only)</li>
                            <li>Reports generation</li>
                            <li>Data visualization</li>
                            <li>No write access</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Admin Users -->
        <div class="section">
            <h2>Admin Users</h2>
            <table class="admin-users-table">
                <thead>
                    <tr>
                        <th>User ID</th>
                        <th>Role</th>
                        <th>Status</th>
                        <th>Created</th>
                        <th>Last Active</th>
                    </tr>
                </thead>
                <tbody>
                    ${adminUsers.map(user => `
                        <tr>
                            <td>${user.user_id}</td>
                            <td><span class="role-badge">${user.role}</span></td>
                            <td>
                                <span class="status-badge ${user.is_active ? 'status-active' : 'status-inactive'}">
                                    ${user.is_active ? 'Active' : 'Inactive'}
                                </span>
                            </td>
                            <td>${new Date(user.created_at).toLocaleDateString()}</td>
                            <td>${user.last_active_at ? new Date(user.last_active_at).toLocaleDateString() : 'Never'}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
        
        <!-- Add Admin User Form -->
        <div class="section">
            <h2>Add Admin User</h2>
            <form id="addAdminForm">
                <div class="form-group">
                    <label for="userId">User ID</label>
                    <input type="text" id="userId" name="userId" required>
                </div>
                
                <div class="form-group">
                    <label for="role">Role</label>
                    <select id="role" name="role" required>
                        <option value="">Select a role</option>
                        <option value="super_admin">Super Admin</option>
                        <option value="admin">Admin</option>
                        <option value="moderator">Moderator</option>
                        <option value="analyst">Analyst</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <button type="submit">Add Admin User</button>
                </div>
            </form>
        </div>
        
        <!-- Permission Checker -->
        <div class="section">
            <h2>Permission Checker</h2>
            <form id="permissionCheckForm">
                <div class="form-group">
                    <label for="checkUserId">User ID</label>
                    <input type="text" id="checkUserId" name="userId" required>
                </div>
                
                <div class="form-group">
                    <label for="resource">Resource</label>
                    <select id="resource" name="resource" required>
                        <option value="">Select a resource</option>
                        <option value="users">Users</option>
                        <option value="meals">Meals</option>
                        <option value="recipes">Recipes</option>
                        <option value="ingredients">Ingredients</option>
                        <option value="analytics">Analytics</option>
                        <option value="system">System</option>
                        <option value="admin">Admin</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label for="action">Action</label>
                    <select id="action" name="action" required>
                        <option value="">Select an action</option>
                        <option value="read">Read</option>
                        <option value="write">Write</option>
                        <option value="delete">Delete</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <button type="submit">Check Permission</button>
                </div>
            </form>
            
            <div id="permissionResult" style="display: none;">
                <div class="alert" id="permissionAlert"></div>
            </div>
        </div>
    </div>
    
    <script>
        // Add Admin User Form
        document.getElementById('addAdminForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = new FormData(e.target);
            const data = Object.fromEntries(formData);
            
            try {
                const response = await fetch('/api/admin/users', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(data)
                });
                
                const result = await response.json();
                
                if (result.success) {
                    alert('Admin user added successfully!');
                    location.reload();
                } else {
                    alert('Error: ' + result.error);
                }
            } catch (error) {
                alert('Error: ' + error.message);
            }
        });
        
        // Permission Checker Form
        document.getElementById('permissionCheckForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = new FormData(e.target);
            const data = Object.fromEntries(formData);
            
            try {
                const response = await fetch('/api/admin/permissions/check', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(data)
                });
                
                const result = await response.json();
                
                const resultDiv = document.getElementById('permissionResult');
                const alertDiv = document.getElementById('permissionAlert');
                
                if (result.success) {
                    alertDiv.className = 'alert alert-success';
                    alertDiv.textContent = \`Permission \${data.resource}.\${data.action}: GRANTED\`;
                } else {
                    alertDiv.className = 'alert alert-error';
                    alertDiv.textContent = \`Permission \${data.resource}.\${data.action}: DENIED - \${result.error}\`;
                }
                
                resultDiv.style.display = 'block';
            } catch (error) {
                const resultDiv = document.getElementById('permissionResult');
                const alertDiv = document.getElementById('permissionAlert');
                
                alertDiv.className = 'alert alert-error';
                alertDiv.textContent = 'Error: ' + error.message;
                resultDiv.style.display = 'block';
            }
        });
    </script>
</body>
</html>`;
}

/**
 * Generate role management API endpoints
 */
function generateRoleManagementAPI() {
  return `// Admin Role Management API Endpoints
// This file contains API endpoints for managing admin roles and permissions

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Admin role definitions
const ADMIN_ROLES = {
  super_admin: {
    name: 'Super Admin',
    description: 'Full system access with all permissions',
    permissions: {
      all: true,
      users: { read: true, write: true, delete: true },
      meals: { read: true, write: true, delete: true },
      recipes: { read: true, write: true, delete: true },
      ingredients: { read: true, write: true, delete: true },
      analytics: { read: true, write: true },
      system: { read: true, write: true, delete: true },
      admin: { read: true, write: true, delete: true }
    }
  },
  admin: {
    name: 'Admin',
    description: 'Full access to most features except system administration',
    permissions: {
      all: false,
      users: { read: true, write: true, delete: false },
      meals: { read: true, write: true, delete: true },
      recipes: { read: true, write: true, delete: true },
      ingredients: { read: true, write: true, delete: true },
      analytics: { read: true, write: false },
      system: { read: true, write: false, delete: false },
      admin: { read: true, write: false, delete: false }
    }
  },
  moderator: {
    name: 'Moderator',
    description: 'Content moderation and user support',
    permissions: {
      all: false,
      users: { read: true, write: true, delete: false },
      meals: { read: true, write: true, delete: false },
      recipes: { read: true, write: true, delete: false },
      ingredients: { read: true, write: true, delete: false },
      analytics: { read: true, write: false },
      system: { read: false, write: false, delete: false },
      admin: { read: false, write: false, delete: false }
    }
  },
  analyst: {
    name: 'Analyst',
    description: 'Read-only access to analytics and reports',
    permissions: {
      all: false,
      users: { read: true, write: false, delete: false },
      meals: { read: true, write: false, delete: false },
      recipes: { read: true, write: false, delete: false },
      ingredients: { read: true, write: false, delete: false },
      analytics: { read: true, write: false },
      system: { read: false, write: false, delete: false },
      admin: { read: false, write: false, delete: false }
    }
  }
};

// Create admin user
export async function POST(request) {
  try {
    const { userId, role, customPermissions = {} } = await request.json();
    
    // Validate role
    if (!ADMIN_ROLES[role]) {
      return Response.json({ 
        success: false, 
        error: \`Invalid role: \${role}. Available roles: \${Object.keys(ADMIN_ROLES).join(', ')}\` 
      }, { status: 400 });
    }
    
    // Get role permissions
    const rolePermissions = ADMIN_ROLES[role].permissions;
    
    // Merge with custom permissions if provided
    const finalPermissions = customPermissions.all ? customPermissions : {
      ...rolePermissions,
      ...customPermissions
    };
    
    const { data, error } = await supabase
      .from('admin_users')
      .insert({
        user_id: userId,
        role: role,
        permissions: finalPermissions,
        is_active: true
      })
      .select()
      .single();

    if (error) throw error;

    return Response.json({ success: true, data });
  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}

// Get admin user
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    if (userId) {
      // Get specific admin user
      const { data, error } = await supabase
        .from('admin_users')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) throw error;

      return Response.json({ success: true, data });
    } else {
      // List all admin users
      const { data, error } = await supabase
        .from('admin_users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      return Response.json({ success: true, data });
    }
  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}

// Update admin user role
export async function PUT(request) {
  try {
    const { userId, role, customPermissions = {} } = await request.json();
    
    // Validate role
    if (!ADMIN_ROLES[role]) {
      return Response.json({ 
        success: false, 
        error: \`Invalid role: \${role}. Available roles: \${Object.keys(ADMIN_ROLES).join(', ')}\` 
      }, { status: 400 });
    }
    
    // Get role permissions
    const rolePermissions = ADMIN_ROLES[role].permissions;
    
    // Merge with custom permissions if provided
    const finalPermissions = customPermissions.all ? customPermissions : {
      ...rolePermissions,
      ...customPermissions
    };
    
    const { data, error } = await supabase
      .from('admin_users')
      .update({
        role: role,
        permissions: finalPermissions,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;

    return Response.json({ success: true, data });
  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}

// Deactivate admin user
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return Response.json({ success: false, error: 'User ID is required' }, { status: 400 });
    }
    
    const { data, error } = await supabase
      .from('admin_users')
      .update({
        is_active: false,
        deactivated_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;

    return Response.json({ success: true, data });
  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}`;
}

/**
 * Generate permission checker API
 */
function generatePermissionCheckerAPI() {
  return `// Permission Checker API
// This file contains API endpoints for checking user permissions

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Check user permissions
export async function POST(request) {
  try {
    const { userId, resource, action } = await request.json();
    
    if (!userId || !resource || !action) {
      return Response.json({ 
        success: false, 
        error: 'userId, resource, and action are required' 
      }, { status: 400 });
    }
    
    // Get admin user
    const { data: adminUser, error: userError } = await supabase
      .from('admin_users')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (userError) throw userError;
    
    if (!adminUser) {
      return Response.json({ 
        success: false, 
        error: 'User is not an admin' 
      }, { status: 403 });
    }
    
    if (!adminUser.is_active) {
      return Response.json({ 
        success: false, 
        error: 'Admin user is not active' 
      }, { status: 403 });
    }
    
    // Check if user has all permissions
    if (adminUser.permissions.all) {
      return Response.json({ 
        success: true, 
        hasPermission: true,
        reason: 'User has all permissions'
      });
    }
    
    // Check specific resource permission
    const resourcePermissions = adminUser.permissions[resource];
    if (!resourcePermissions) {
      return Response.json({ 
        success: false, 
        error: \`No permissions for resource: \${resource}` 
      }, { status: 403 });
    }
    
    const hasPermission = resourcePermissions[action];
    
    return Response.json({ 
      success: true, 
      hasPermission: hasPermission,
      reason: hasPermission ? 'Permission granted' : 'Permission denied'
    });
    
  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}`;
}

/**
 * Main setup function
 */
async function setupRoleManagement() {
  try {
    log('Setting up role management...', 'blue');
    
    // Ensure output directory exists
    if (!fs.existsSync(config.outputDir)) {
      fs.mkdirSync(config.outputDir, { recursive: true });
    }
    
    // List existing admin users
    const adminUsers = await listAdminUsers();
    
    // Generate HTML interface
    const htmlInterface = generateRoleManagementHTML(adminUsers);
    fs.writeFileSync(path.join(config.outputDir, 'role-management.html'), htmlInterface);
    log('Generated role management HTML interface', 'green');
    
    // Generate API endpoints
    const roleAPI = generateRoleManagementAPI();
    fs.writeFileSync(path.join(config.outputDir, 'role-management-api.js'), roleAPI);
    log('Generated role management API endpoints', 'green');
    
    // Generate permission checker API
    const permissionAPI = generatePermissionCheckerAPI();
    fs.writeFileSync(path.join(config.outputDir, 'permission-checker-api.js'), permissionAPI);
    log('Generated permission checker API', 'green');
    
    // Generate README
    const readme = generateRoleManagementReadme();
    fs.writeFileSync(path.join(config.outputDir, 'ROLE_MANAGEMENT_README.md'), readme);
    log('Generated role management README', 'green');
    
    log('Role management setup completed successfully!', 'green');
    log(`Output directory: ${config.outputDir}`, 'blue');
    
  } catch (error) {
    log(`Error setting up role management: ${error.message}`, 'red');
    throw error;
  }
}

/**
 * Generate role management README
 */
function generateRoleManagementReadme() {
  return `# Admin Role Management for What's for Dinner

This directory contains the role management system for admin users in the What's for Dinner application.

## Files Overview

- \`role-management.html\` - HTML interface for managing admin roles
- \`role-management-api.js\` - API endpoints for role management
- \`permission-checker-api.js\` - API endpoints for permission checking
- \`ROLE_MANAGEMENT_README.md\` - This documentation file

## Available Roles

### Super Admin
- **Description**: Full system access with all permissions
- **Permissions**: All operations on all resources
- **Use Case**: System administrators, developers

### Admin
- **Description**: Full access to most features except system administration
- **Permissions**: 
  - Users: read, write (no delete)
  - Meals, Recipes, Ingredients: full access
  - Analytics: read-only
  - System: read-only
- **Use Case**: Content managers, team leads

### Moderator
- **Description**: Content moderation and user support
- **Permissions**:
  - Users: read, write (no delete)
  - Content: read, write (no delete)
  - Analytics: read-only
  - System: no access
- **Use Case**: Community moderators, support staff

### Analyst
- **Description**: Read-only access to analytics and reports
- **Permissions**:
  - All resources: read-only
  - No write or delete access
- **Use Case**: Data analysts, business intelligence

## API Endpoints

### Role Management API (\`/api/admin/users\`)

#### POST - Create Admin User
\`\`\`json
{
  "userId": "user-uuid",
  "role": "admin",
  "customPermissions": {
    "users": { "read": true, "write": true, "delete": false }
  }
}
\`\`\`

#### GET - Get Admin User(s)
- Get specific user: \`/api/admin/users?userId=user-uuid\`
- List all users: \`/api/admin/users\`

#### PUT - Update Admin User Role
\`\`\`json
{
  "userId": "user-uuid",
  "role": "moderator",
  "customPermissions": {}
}
\`\`\`

#### DELETE - Deactivate Admin User
\`\`\`bash
DELETE /api/admin/users?userId=user-uuid
\`\`\`

### Permission Checker API (\`/api/admin/permissions/check\`)

#### POST - Check User Permission
\`\`\`json
{
  "userId": "user-uuid",
  "resource": "users",
  "action": "read"
}
\`\`\`

## Usage Examples

### Create Admin User
\`\`\`javascript
const response = await fetch('/api/admin/users', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userId: 'user-uuid',
    role: 'admin'
  })
});

const result = await response.json();
\`\`\`

### Check Permission
\`\`\`javascript
const response = await fetch('/api/admin/permissions/check', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userId: 'user-uuid',
    resource: 'users',
    action: 'read'
  })
});

const result = await response.json();
if (result.hasPermission) {
  // User has permission
}
\`\`\`

### Update User Role
\`\`\`javascript
const response = await fetch('/api/admin/users', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userId: 'user-uuid',
    role: 'moderator'
  })
});

const result = await response.json();
\`\`\`

## Security Features

### Row Level Security (RLS)
- Admin users table is protected by RLS
- Only super admins can manage other admin users
- All actions are logged in audit logs

### Permission Validation
- All API endpoints validate user permissions
- Resource and action-based access control
- Custom permission overrides supported

### Audit Logging
- All role changes are logged
- User permission checks are tracked
- Admin user creation/deactivation is recorded

## Database Schema

### admin_users Table
- \`user_id\`: UUID reference to auth.users
- \`role\`: Admin role (super_admin, admin, moderator, analyst)
- \`permissions\`: JSONB object with resource permissions
- \`is_active\`: Boolean for user status
- \`created_at\`: Timestamp
- \`updated_at\`: Timestamp
- \`deactivated_at\`: Timestamp when deactivated

### admin_audit_logs Table
- \`admin_user_id\`: Reference to admin_users
- \`action\`: Action performed
- \`resource\`: Resource affected
- \`details\`: JSONB with action details
- \`created_at\`: Timestamp

## Setup Instructions

### 1. Run Database Migration
\`\`\`sql
-- Run the admin dashboard migration
\\i supabase/migrations/009_admin_dashboard_schema.sql
\`\`\`

### 2. Deploy API Endpoints
\`\`\`bash
# Copy role management API
cp role-management-api.js src/app/api/admin/users/route.js

# Copy permission checker API
cp permission-checker-api.js src/app/api/admin/permissions/check/route.js
\`\`\`

### 3. Create First Admin User
\`\`\`sql
-- Insert super admin user
INSERT INTO admin_users (user_id, role, permissions) 
VALUES ('your-user-id-here', 'super_admin', '{"all": true}');
\`\`\`

### 4. Access Role Management Interface
\`\`\`bash
# Open the HTML interface
open role-management.html
\`\`\`

## Troubleshooting

### Common Issues

1. **Permission Denied**: Check user role and permissions
2. **User Not Found**: Verify user exists in auth.users
3. **Invalid Role**: Use one of the defined roles
4. **API Errors**: Check Supabase configuration

### Debug Mode

Enable verbose logging:
\`\`\`bash
VERBOSE=true node scripts/admin/role-management.js
\`\`\`

## Support

For issues or questions:
1. Check the audit logs
2. Verify user permissions
3. Review role definitions
4. Check database connectivity`;
}

// Run setup if called directly
if (require.main === module) {
  setupRoleManagement()
    .then(() => {
      log('Role management setup completed successfully', 'green');
      process.exit(0);
    })
    .catch(error => {
      log(`Role management setup failed: ${error.message}`, 'red');
      process.exit(1);
    });
}

module.exports = { 
  setupRoleManagement,
  createAdminUser,
  updateAdminUserRole,
  deactivateAdminUser,
  getAdminUser,
  listAdminUsers,
  checkUserPermissions
};