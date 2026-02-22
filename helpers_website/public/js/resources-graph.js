/**
 * Resources Graph Visualization
 * Clean engineering visualization of enterprise resources
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
			this.animate();
		},

		setupCanvas() {
			this.width = this.canvas.width = window.innerWidth;
			this.height = this.canvas.height = window.innerHeight;
			window.addEventListener('resize', () => {
				this.width = this.canvas.width = window.innerWidth;
				this.height = this.canvas.height = window.innerHeight;
			});
		},

		async loadData() {
			try {
				const result = await frappe.call({
					method: 'helpers_website.api.get_resources_graph'
				});
				
				if (result.message && result.message.success) {
					this.setData(result.message.nodes, result.message.links);
				}
			} catch (e) {
				console.error('Load error:', e);
			}
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
			// Clear with fade
			this.ctx.fillStyle = 'rgba(10, 10, 10, 0.08)';
			this.ctx.fillRect(0, 0, this.width, this.height);

			// Draw links
			this.ctx.strokeStyle = 'rgba(80, 80, 80, 0.3)';
			this.ctx.lineWidth = 0.8;
			for (const link of this.links) {
				this.ctx.beginPath();
				this.ctx.moveTo(link.source.x, link.source.y);
				this.ctx.lineTo(link.target.x, link.target.y);
				this.ctx.stroke();
			}

			// Draw nodes
			for (const node of this.nodes) {
				// Simple circle
				this.ctx.fillStyle = '#E5E5E5';
				this.ctx.beginPath();
				this.ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
				this.ctx.fill();
			}
		},

		animate() {
			this.updateSimulation();
			this.draw();
			requestAnimationFrame(() => this.animate());
		}
	};

	// Auto-initialize
	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', () => ResourcesGraph.init());
	} else {
		ResourcesGraph.init();
	}

	window.ResourcesGraph = ResourcesGraph;
})();
