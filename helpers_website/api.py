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
		# Try to get Item resources
		items = frappe.get_list(
			"Item",
			fields=["name", "item_name", "item_group", "description"],
			filters={"disabled": 0},
			limit_page_length=100
		)
		
		nodes = []
		links = []
		
		# Create nodes from items
		for item in items:
			nodes.append({
				"id": item.get("name"),
				"label": item.get("item_name") or item.get("name"),
				"type": "item",
				"group": item.get("item_group"),
				"description": item.get("description")
			})
		
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
		
		# If no items found, return structure with placeholder
		if not nodes:
			nodes = [
				{"id": "res_1", "label": "Resource 1", "type": "item", "group": "Default"},
				{"id": "res_2", "label": "Resource 2", "type": "item", "group": "Default"},
				{"id": "res_3", "label": "Resource 3", "type": "item", "group": "Default"},
			]
			links = [
				{"source": "res_1", "target": "res_2", "type": "related"},
				{"source": "res_2", "target": "res_3", "type": "related"},
				{"source": "res_1", "target": "res_3", "type": "related"},
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
