/**
 * Resources Graph Visualization
 * Clean engineering visualization of enterprise resources
 * GitHub Pages - Static JSON version
 */

(function() {
	'use strict';

	const ResourcesGraph = {
		canvas: null,
		ctx: null,
		width: 0,
		height: 0,
		nodes: [],
		links: [],
		simulation: {
			alpha: 1,
			decay: 0.9985,
			forceStrength: -800,
			linkStrength: 0.05,
			centerStrength: 0.02,
			friction: 0.85
		},

		async init() {
			this.canvas = document.getElementById('resources-graph-canvas');
			if (!this.canvas) return;

			this.ctx = this.canvas.getContext('2d');
			this.setupCanvas();
			await this.loadData();
			this.runLayout(220);
			this.draw();
			this.animate();
		},

		setupCanvas() {
			this.width = this.canvas.width = window.innerWidth;
			this.height = this.canvas.height = window.innerHeight;
			window.addEventListener('resize', () => {
				this.width = this.canvas.width = window.innerWidth;
				this.height = this.canvas.height = window.innerHeight;
				if (this.nodes.length) {
					this.draw();
				}
			});
		},

		async loadData() {
			try {
				// Load static JSON from docs/data/graph.json
				const response = await fetch('./data/graph.json');
				if (!response.ok) {
					throw new Error('Failed to fetch graph data');
				}
				
				const data = await response.json();
				if (data && data.nodes && data.links) {
					this.setData(data.nodes, data.links);
				} else {
					this.setData([], []);
				}
			} catch (e) {
				console.error('Load error:', e);
				// Fallback to demo data if loading fails
				this.setData(this.getDemoData().nodes, this.getDemoData().links);
			}
		},

		getDemoData() {
			return {
				nodes: [
					{"id": "emp_1", "label": "Alice Chen", "type": "employee", "group": "Engineering"},
					{"id": "emp_2", "label": "Bob Smith", "type": "employee", "group": "Engineering"},
					{"id": "emp_3", "label": "Carol Lee", "type": "employee", "group": "Operations"},
					{"id": "res_1", "label": "Server A", "type": "item", "group": "Hardware"},
					{"id": "res_2", "label": "Database", "type": "item", "group": "Software"},
				],
				links: [
					{"source": "emp_1", "target": "emp_2", "type": "department"},
					{"source": "emp_1", "target": "res_1", "type": "task"},
					{"source": "emp_2", "target": "res_2", "type": "task"},
					{"source": "emp_3", "target": "res_1", "type": "task"},
				]
			};
		},

		setData(nodes, links) {
			const centerX = this.width / 2;
			const centerY = this.height / 2;
			
			this.nodes = nodes.map((node, i) => ({
				...node,
				x: centerX + (Math.random() - 0.5) * 400,
				y: centerY + (Math.random() - 0.5) * 400,
				vx: 0,
				vy: 0,
				radius: 3 + Math.random() * 4
			}));

			this.links = links.map(link => ({
				...link,
				source: this.nodes.find(n => n.id === link.source),
				target: this.nodes.find(n => n.id === link.target)
			})).filter(l => l.source && l.target);
		},

		runLayout(iterations) {
			for (let i = 0; i < iterations; i++) {
				this.updateSimulation();
			}

			for (const node of this.nodes) {
				node.vx = 0;
				node.vy = 0;
			}
		},

		updateSimulation() {
			if (this.nodes.length === 0) return;

			const centerX = this.width / 2;
			const centerY = this.height / 2;

			for (let i = 0; i < this.nodes.length; i++) {
				const node = this.nodes[i];

				// Center gravity
				const dcx = centerX - node.x;
				const dcy = centerY - node.y;
				node.vx += dcx * this.simulation.centerStrength;
				node.vy += dcy * this.simulation.centerStrength;

				// Node repulsion
				for (let j = i + 1; j < this.nodes.length; j++) {
					const other = this.nodes[j];
					const dx = node.x - other.x;
					const dy = node.y - other.y;
					const dist = Math.sqrt(dx * dx + dy * dy) || 1;
					const force = this.simulation.forceStrength / (dist * dist);
					
					const fx = (dx / dist) * force;
					const fy = (dy / dist) * force;
					
					node.vx += fx;
					node.vy += fy;
					other.vx -= fx;
					other.vy -= fy;
				}
			}

			// Link attraction
			for (const link of this.links) {
				const dx = link.target.x - link.source.x;
				const dy = link.target.y - link.source.y;
				const dist = Math.sqrt(dx * dx + dy * dy) || 1;
				const force = this.simulation.linkStrength * dist;
				
				const fx = (dx / dist) * force;
				const fy = (dy / dist) * force;
				
				link.source.vx += fx;
				link.source.vy += fy;
				link.target.vx -= fx;
				link.target.vy -= fy;
			}

			// Update positions
			for (const node of this.nodes) {
				node.vx *= this.simulation.friction;
				node.vy *= this.simulation.friction;
				node.x += node.vx;
				node.y += node.vy;
			}
		},

		draw() {
			// Clear canvas (transparent to show grid background)
			this.ctx.clearRect(0, 0, this.width, this.height);

			// Draw links
			this.ctx.strokeStyle = 'rgba(70, 130, 180, 0.4)';
			this.ctx.lineWidth = 1.2;
			for (const link of this.links) {
				this.ctx.beginPath();
				this.ctx.moveTo(link.source.x, link.source.y);
				this.ctx.lineTo(link.target.x, link.target.y);
				this.ctx.stroke();
			}

			// Draw nodes
			for (const node of this.nodes) {
				// Blue engineering style
				this.ctx.fillStyle = '#1e40af';
				this.ctx.strokeStyle = '#3b82f6';
				this.ctx.lineWidth = 1.5;
				this.ctx.beginPath();
				this.ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
				this.ctx.fill();
				this.ctx.stroke();
			}

			// Draw labels
			this.ctx.fillStyle = 'rgba(30, 64, 175, 0.9)';
			this.ctx.font = '12px "Space Mono", monospace';
			this.ctx.textAlign = 'left';
			this.ctx.textBaseline = 'middle';
			for (const node of this.nodes) {
				const label = node.label || node.id;
				this.ctx.fillText(label, node.x + node.radius + 6, node.y);
			}
		},

		animate() {
			this.updateSimulation();
			this.draw();
			requestAnimationFrame(() => this.animate());
		}
	};

	window.ResourcesGraph = ResourcesGraph;
})();
