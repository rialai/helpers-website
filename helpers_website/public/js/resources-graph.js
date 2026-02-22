/**
 * Resources Graph Visualization
 * Displays enterprise resources as an interactive force-directed graph
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
		animationTime: 0,
		simulation: {
			alpha: 1,
			decay: 0.999,
			forceStrength: -30,
			linkStrength: 0.1,
			friction: 0.5
		},

		async init() {
			this.canvas = document.getElementById('resources-graph-canvas');
			if (!this.canvas) return;

			this.ctx = this.canvas.getContext('2d');
			this.setupCanvas();
			
			// Load resources data from server
			try {
				const response = await frappe.call({
					method: 'helpers_website.api.get_resources_graph',
					callback: (r) => {
						if (r.message && r.message.success) {
							this.setData(r.message.nodes, r.message.links);
							this.animate();
						}
					}
				});
			} catch (e) {
				console.error('Failed to load resources:', e);
				this.animate();
			}
		},

		setupCanvas() {
			const rect = this.canvas.parentElement.getBoundingClientRect();
			this.width = this.canvas.width = rect.width || window.innerWidth;
			this.height = this.canvas.height = rect.height || window.innerHeight;

			window.addEventListener('resize', () => this.onResize());
		},

		onResize() {
			const rect = this.canvas.parentElement.getBoundingClientRect();
			this.width = this.canvas.width = rect.width || window.innerWidth;
			this.height = this.canvas.height = rect.height || window.innerHeight;
		},

		setData(nodes, links) {
			// Initialize nodes with positions
			this.nodes = nodes.map((node, i) => ({
				...node,
				x: (Math.random() - 0.5) * this.width,
				y: (Math.random() - 0.5) * this.height,
				vx: (Math.random() - 0.5) * 2,
				vy: (Math.random() - 0.5) * 2,
				radius: 4 + Math.random() * 6
			}));

			this.links = links.map(link => ({
				...link,
				sourceNode: this.nodes.find(n => n.id === link.source),
				targetNode: this.nodes.find(n => n.id === link.target)
			})).filter(l => l.sourceNode && l.targetNode);
		},

		updateSimulation() {
			if (this.nodes.length === 0) return;

			// Apply forces
			for (let i = 0; i < this.nodes.length; i++) {
				const node = this.nodes[i];

				// Repulsive forces between all nodes
				for (let j = 0; j < this.nodes.length; j++) {
					if (i === j) continue;
					const other = this.nodes[j];
					const dx = node.x - other.x;
					const dy = node.y - other.y;
					const distance = Math.sqrt(dx * dx + dy * dy) || 1;
					const force = this.simulation.forceStrength / (distance * distance);
					
					node.vx += (dx / distance) * force;
					node.vy += (dy / distance) * force;
				}

				// Attractive forces along links
				for (const link of this.links) {
					if (link.sourceNode === node) {
						const other = link.targetNode;
						const dx = other.x - node.x;
						const dy = other.y - node.y;
						const distance = Math.sqrt(dx * dx + dy * dy) || 1;
						const force = this.simulation.linkStrength * distance;
						
						node.vx += (dx / distance) * force;
						node.vy += (dy / distance) * force;
					}
				}

				// Damping
				node.vx *= this.simulation.friction;
				node.vy *= this.simulation.friction;

				// Update position
				node.x += node.vx;
				node.y += node.vy;

				// Boundary conditions
				const padding = 50;
				if (node.x < -padding) node.x = this.width + padding;
				if (node.x > this.width + padding) node.x = -padding;
				if (node.y < -padding) node.y = this.height + padding;
				if (node.y > this.height + padding) node.y = -padding;
			}

			// Apply decay
			this.simulation.alpha *= this.simulation.decay;
		},

		draw() {
			// Clear canvas
			this.ctx.fillStyle = 'rgba(15, 15, 15, 0.02)';
			this.ctx.fillRect(0, 0, this.width, this.height);

			// Draw links
			this.ctx.strokeStyle = 'rgba(200, 200, 200, 0.15)';
			this.ctx.lineWidth = 1;
			for (const link of this.links) {
				const source = link.sourceNode;
				const target = link.targetNode;
				this.ctx.beginPath();
				this.ctx.moveTo(source.x, source.y);
				this.ctx.lineTo(target.x, target.y);
				this.ctx.stroke();
			}

			// Draw nodes
			for (const node of this.nodes) {
				const r = node.radius;
				
				// Glow effect
				this.ctx.shadowColor = 'rgba(255, 255, 255, 0.3)';
				this.ctx.shadowBlur = 8;

				// Node circle
				this.ctx.fillStyle = this.getNodeColor(node.type);
				this.ctx.beginPath();
				this.ctx.arc(node.x, node.y, r, 0, Math.PI * 2);
				this.ctx.fill();

				this.ctx.shadowBlur = 0;
			}
		},

		getNodeColor(type) {
			const colors = {
				item: 'rgba(212, 175, 255, 0.9)',
				bom: 'rgba(100, 200, 255, 0.9)',
				process: 'rgba(100, 255, 200, 0.9)',
				default: 'rgba(210, 210, 210, 0.9)'
			};
			return colors[type] || colors.default;
		},

		animate() {
			this.updateSimulation();
			this.draw();
			requestAnimationFrame(() => this.animate());
		}
	};

	// Initialize when DOM is ready
	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', () => ResourcesGraph.init());
	} else {
		ResourcesGraph.init();
	}

	window.ResourcesGraph = ResourcesGraph;
})();
