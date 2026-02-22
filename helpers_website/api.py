"""
API methods for helpers_website
"""
import frappe
import json


@frappe.whitelist(allow_guest=True)
def get_resources_graph():
	"""
	Get resources data for visualization as a graph.
	Returns: {
		nodes: [{id, label, type, ...}],
		links: [{source, target, ...}]
	}
	"""
	try:
		nodes = []
		links = []
		
		# Get Employees
		employees = frappe.get_list(
			"Employee",
			fields=["name", "employee_name", "department", "designation", "status"],
			filters={"status": "Active"},
			limit_page_length=100
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
		items = frappe.get_list(
			"Item",
			fields=["name", "item_name", "item_group", "description"],
			filters={"disabled": 0},
			limit_page_length=100
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
			tasks = frappe.get_list(
				"Task",
				fields=["name", "assigned_to", "item"],
				filters={"status": ["!=", "Cancelled"]},
				limit_page_length=200
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
		except:
			pass
		
		# Try to add relationships from Stock Entry or similar
		# This creates links between items that are related
		if len(items) > 1:
			stock_entries = frappe.get_list(
				"Stock Entry Detail",
				fields=["item_code", "parent"],
				distinct=True,
				limit_page_length=500
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
		
		# If no data found, return structure with placeholder
		if not nodes:
			nodes = [
				{"id": "emp_1", "label": "Alice Chen", "type": "employee", "group": "Engineering"},
				{"id": "emp_2", "label": "Bob Smith", "type": "employee", "group": "Engineering"},
				{"id": "emp_3", "label": "Carol Lee", "type": "employee", "group": "Operations"},
				{"id": "res_1", "label": "Server A", "type": "item", "group": "Hardware"},
				{"id": "res_2", "label": "Database", "type": "item", "group": "Software"},
			]
			links = [
				{"source": "emp_1", "target": "emp_2", "type": "department"},
				{"source": "emp_1", "target": "res_1", "type": "task"},
				{"source": "emp_2", "target": "res_2", "type": "task"},
				{"source": "emp_3", "target": "res_1", "type": "task"},
			]
		
		return {
			"success": True,
			"nodes": nodes,
			"links": links,
			"count": len(nodes)
		}
		
	except Exception as e:
		frappe.log_error(f"Error in get_resources_graph: {str(e)}")
		# Return empty structure if error
		return {
			"success": True,
			"nodes": [],
			"links": [],
			"count": 0
		}


def create_sample_employees():
	"""
	Create sample employees in ERPNext.
	This is an internal function for setting up demo data.
	"""
	# Create genders if they don't exist
	for gender in ['Male', 'Female']:
		if not frappe.db.exists("Gender", gender):
			try:
				g = frappe.new_doc("Gender")
				g.gender = gender
				g.insert(ignore_permissions=True)
				print(f"Created Gender: {gender}")
			except Exception as e:
				print(f"Gender creation error: {str(e)}")
	
	frappe.db.commit()
	
	employees_data = [
		{
			'employee_name': 'Николай Рябец',
			'first_name': 'Николай',
			'last_name': 'Рябец',
			'gender': 'Male',
			'date_of_birth': '1990-01-01',
			'date_of_joining': '2024-01-01',
			'company': 'Helpers',
			'status': 'Active'
		},
		{
			'employee_name': 'Роман Гармашов',
			'first_name': 'Роман',
			'last_name': 'Гармашов',
			'gender': 'Male',
			'date_of_birth': '1992-03-15',
			'date_of_joining': '2024-02-01',
			'company': 'Helpers',
			'status': 'Active'
		},
		{
			'employee_name': 'Игорь Кудряшов',
			'first_name': 'Игорь',
			'last_name': 'Кудряшов',
			'gender': 'Male',
			'date_of_birth': '1988-07-20',
			'date_of_joining': '2024-01-15',
			'company': 'Helpers',
			'status': 'Active'
		},
		{
			'employee_name': 'София Хомяк',
			'first_name': 'София',
			'last_name': 'Хомяк',
			'gender': 'Female',
			'date_of_birth': '1991-11-05',
			'date_of_joining': '2024-03-01',
			'company': 'Helpers',
			'status': 'Active'
		},
		{
			'employee_name': 'Matthew Ryan',
			'first_name': 'Matthew',
			'last_name': 'Ryan',
			'gender': 'Male',
			'date_of_birth': '1993-05-12',
			'date_of_joining': '2024-02-15',
			'company': 'Helpers',
			'status': 'Active'
		},
		{
			'employee_name': 'Michael Phelan',
			'first_name': 'Michael',
			'last_name': 'Phelan',
			'gender': 'Male',
			'date_of_birth': '1994-09-28',
			'date_of_joining': '2024-04-01',
			'company': 'Helpers',
			'status': 'Active'
		},
		{
			'employee_name': 'Андрей Антонов',
			'first_name': 'Андрей',
			'last_name': 'Антонов',
			'gender': 'Male',
			'date_of_birth': '1989-06-18',
			'date_of_joining': '2024-03-15',
			'company': 'Helpers',
			'status': 'Active'
		}
	]
	
	created = []
	errors = []
	
	for emp_data in employees_data:
		try:
			# Check if employee already exists
			existing = frappe.db.exists("Employee", {"employee_name": emp_data['employee_name']})
			if existing:
				print(f"Skipped: {emp_data['employee_name']} (already exists)")
				continue
			
			emp = frappe.new_doc('Employee')
			emp.update(emp_data)
			emp.insert(ignore_permissions=True)
			created.append(emp.name)
			print(f"Created: {emp.employee_name} ({emp.name})")
		except Exception as e:
			error_msg = f"Error creating {emp_data['employee_name']}: {str(e)}"
			errors.append(error_msg)
			print(error_msg)
	
	frappe.db.commit()
	
	result = {
		'success': True,
		'created': len(created),
		'employees': created,
		'errors': errors
	}
	print(f"\n✅ Created {len(created)} employees")
	return result
