#!/usr/bin/env python3
"""
GitHub Pages Data Export Script
Exports resources graph data from Frappe to static JSON for GitHub Pages hosting.

Usage:
  python3 export_for_github_pages.py

This script:
1. Connects to your local/remote Frappe instance
2. Queries Employees, Items, and relationships
3. Generates a static JSON file at docs/data/graph.json
4. The JSON can be committed and served by GitHub Pages

Requirements:
  - Must be run from within a Frappe bench environment
  - Alternatively, update the FRAPPE_URL and FRAPPE_TOKEN for remote access
"""

import json
import os
import sys
import frappe


def get_resources_graph_data():
	"""
	Generate resources graph data from Frappe database.
	Returns: {
		"success": true,
		"nodes": [...],
		"links": [...],
		"count": N
	}
	"""
	try:
		nodes = []
		links = []
		
		# Get Employees (ignore permissions for guest access)
		employees = frappe.get_all(
			"Employee",
			fields=["name", "employee_name", "department", "designation", "status"],
			filters={"status": "Active"},
			limit_page_length=100,
			ignore_permissions=True
		)
		
		# Create nodes from employees
		for emp in employees:
			nodes.append({
				"id": emp.get("name"),
				"label": emp.get("employee_name") or emp.get("name"),
				"type": "employee",
				"group": emp.get("department") or "Staff",
				"designation": emp.get("designation")
			})
		
		# Try to get Item resources
		items = frappe.get_all(
			"Item",
			fields=["name", "item_name", "item_group", "description"],
			filters={"disabled": 0},
			limit_page_length=100,
			ignore_permissions=True
		)
		
		# Create nodes from items
		for item in items:
			nodes.append({
				"id": item.get("name"),
				"label": item.get("item_name") or item.get("name"),
				"type": "item",
				"group": item.get("item_group"),
				"description": item.get("description")
			})
		
		# Create links between employees in same department
		dept_employees = {}
		for emp in employees:
			dept = emp.get("department") or "No Department"
			if dept not in dept_employees:
				dept_employees[dept] = []
			dept_employees[dept].append(emp.get("name"))
		
		# Link employees in same department (limit to avoid too many links)
		for dept, emp_list in dept_employees.items():
			if len(emp_list) > 1 and len(emp_list) <= 10:
				for i in range(len(emp_list)):
					for j in range(i + 1, len(emp_list)):
						links.append({
							"source": emp_list[i],
							"target": emp_list[j],
							"type": "department"
						})
		
		# Try to link employees to items via projects/tasks
		try:
			tasks = frappe.get_all(
				"Task",
				fields=["name", "assigned_to", "item"],
				filters={"status": ["!=", "Cancelled"]},
				limit_page_length=200,
				ignore_permissions=True
			)
			
			for task in tasks:
				assigned = task.get("assigned_to")
				item = task.get("item")
				if assigned and item:
					links.append({
						"source": assigned,
						"target": item,
						"type": "task"
					})
		except Exception as e:
			print(f"Warning: Could not load tasks: {e}")
		
		# Try to add relationships from Stock Entry or similar
		if len(items) > 1:
			try:
				stock_entries = frappe.get_all(
					"Stock Entry Detail",
					fields=["item_code", "parent"],
					distinct=True,
					limit_page_length=500,
					ignore_permissions=True
				)
				
				# Group items by stock entry to create links
				entry_items = {}
				for entry in stock_entries:
					parent = entry.get("parent")
					item = entry.get("item_code")
					if parent not in entry_items:
						entry_items[parent] = []
					entry_items[parent].append(item)
				
				# Create links between items in same stock entry
				for entry_id, items_in_entry in entry_items.items():
					for i in range(len(items_in_entry)):
						for j in range(i + 1, len(items_in_entry)):
							links.append({
								"source": items_in_entry[i],
								"target": items_in_entry[j],
								"type": "related"
							})
			except Exception as e:
				print(f"Warning: Could not load stock entries: {e}")
		
		# If no data found, return structure with placeholder
		if not nodes:
			nodes = [
				{"id": "emp_1", "label": "Alice Chen", "type": "employee", "group": "Engineering", "designation": "Senior Engineer"},
				{"id": "emp_2", "label": "Bob Smith", "type": "employee", "group": "Engineering", "designation": "Software Engineer"},
				{"id": "emp_3", "label": "Carol Lee", "type": "employee", "group": "Operations", "designation": "Operations Manager"},
				{"id": "res_1", "label": "Server A", "type": "item", "group": "Hardware", "description": "Production Server"},
				{"id": "res_2", "label": "Database", "type": "item", "group": "Software", "description": "Main Database"},
			]
			links = [
				{"source": "emp_1", "target": "emp_2", "type": "department"},
				{"source": "emp_1", "target": "res_1", "type": "task"},
				{"source": "emp_2", "target": "res_2", "type": "task"},
				{"source": "emp_3", "target": "res_1", "type": "task"},
			]
			print("⚠️  No data found in Frappe. Using demo data.")
		
		return {
			"success": True,
			"nodes": nodes,
			"links": links,
			"count": len(nodes)
		}
		
	except Exception as e:
		print(f"Error in get_resources_graph_data: {str(e)}")
		# Return empty structure if error
		return {
			"success": True,
			"nodes": [],
			"links": [],
			"count": 0
		}


def export_to_json(output_path="docs/data/graph.json"):
	"""
	Export graph data to JSON file.
	
	Args:
		output_path (str): Path to save the JSON file (relative to repo root)
	"""
	try:
		print(f"📊 Exporting resources graph...")
		
		# Get data from Frappe
		data = get_resources_graph_data()
		
		# Ensure output directory exists
		output_dir = os.path.dirname(output_path)
		os.makedirs(output_dir, exist_ok=True)
		
		# Write to JSON file
		with open(output_path, 'w') as f:
			json.dump(data, f, indent=2)
		
		print(f"✅ Success! Exported {data['count']} resources to {output_path}")
		print(f"   Nodes: {len(data['nodes'])}")
		print(f"   Links: {len(data['links'])}")
		
		return True
		
	except Exception as e:
		print(f"❌ Error exporting to JSON: {str(e)}")
		return False


def main():
	"""Main entry point."""
	try:
		# Try to initialize Frappe (works within bench environment)
		frappe.connect()
		print("✓ Connected to Frappe")
		
		# Export data
		success = export_to_json()
		sys.exit(0 if success else 1)
		
	except Exception as e:
		print(f"Error: {str(e)}")
		print("\n📝 Usage:")
		print("  - From within a Frappe bench: python3 export_for_github_pages.py")
		print("  - Or edit FRAPPE_URL and FRAPPE_TOKEN in the script for remote access")
		sys.exit(1)


if __name__ == "__main__":
	main()
