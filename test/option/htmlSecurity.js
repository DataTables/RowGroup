describe('RowGroup - HTML Security', function() {
	var table;

	dt.libs({
		js: ['jquery', 'datatables', 'rowgroup'],
		css: ['datatables', 'rowgroup']
	});

	describe('XSS Prevention', function() {
		dt.html('basic');
		it('Prevents XSS injection via dataSrc function returning malicious HTML', function() {
			table = $('#example').DataTable({
				order: [[2, 'asc']],
				rowGroup: {
					dataSrc: function(row, type) {
						return '<img src=x onerror=alert(1)>';
					}
				}
			});

			// Verify the HTML is escaped (rendered as text, not executed)
			var groupRow = $('#example tbody tr:eq(0) th');
			expect(groupRow.text()).toBe('<img src=x onerror=alert(1)>');
			// Verify no img element was created (HTML was escaped)
			expect(groupRow.find('img').length).toBe(0);
		});

		dt.html('basic');
		it('Prevents XSS injection via dataSrc function returning script tag', function() {
			table = $('#example').DataTable({
				order: [[2, 'asc']],
				rowGroup: {
					dataSrc: function(row, type) {
						return '<script>alert("XSS")</script>';
					}
				}
			});

			// Verify the script tag is escaped and displayed as text
			var groupRow = $('#example tbody tr:eq(0) th');
			expect(groupRow.text()).toBe('<script>alert("XSS")</script>');
			// Verify no script element was created
			expect(groupRow.find('script').length).toBe(0);
		});

		dt.html('basic');
		it('Prevents XSS via event handlers in default rendering', function() {
			table = $('#example').DataTable({
				order: [[2, 'asc']],
				rowGroup: {
					dataSrc: function(row, type) {
						return '<div onload=alert(1)>Test</div>';
					}
				}
			});

			// Verify the HTML is escaped
			var groupRow = $('#example tbody tr:eq(0) th');
			expect(groupRow.text()).toBe('<div onload=alert(1)>Test</div>');
			// Verify no div element was created
			expect(groupRow.find('div').length).toBe(0);
		});
	});

	describe('Custom Renderer Compatibility', function() {
		dt.html('basic');
		it('Allows intentional HTML from custom startRender function', function() {
			table = $('#example').DataTable({
				order: [[2, 'asc']],
				rowGroup: {
					dataSrc: 2,
					startRender: function(rows, group) {
						return '<strong>' + group + '</strong>';
					}
				}
			});

			// Verify the HTML is rendered (strong tag exists)
			var groupRow = $('#example tbody tr:eq(0) th');
			expect(groupRow.find('strong').length).toBe(1);
			expect(groupRow.find('strong').text()).toBe('Edinburgh');
		});

		dt.html('basic');
		it('Allows custom HTML with multiple elements', function() {
			table = $('#example').DataTable({
				order: [[2, 'asc']],
				rowGroup: {
					dataSrc: 2,
					startRender: function(rows, group) {
						return '<em>City:</em> <strong>' + group + '</strong>';
					}
				}
			});

			// Verify both HTML elements are rendered
			var groupRow = $('#example tbody tr:eq(0) th');
			expect(groupRow.find('em').length).toBe(1);
			expect(groupRow.find('strong').length).toBe(1);
			expect(groupRow.find('em').text()).toBe('City:');
			expect(groupRow.find('strong').text()).toBe('Edinburgh');
		});

		dt.html('basic');
		it('Allows custom renderer to return DOM nodes', function() {
			table = $('#example').DataTable({
				order: [[2, 'asc']],
				rowGroup: {
					dataSrc: 2,
					startRender: function(rows, group) {
						return $('<span class="custom-group">' + group + '</span>')[0];
					}
				}
			});

			// Verify the custom element was rendered
			var groupRow = $('#example tbody tr:eq(0) th');
			expect(groupRow.find('span.custom-group').length).toBe(1);
			expect(groupRow.find('span.custom-group').text()).toBe('Edinburgh');
		});
	});

	describe('Default Rendering Safety', function() {
		dt.html('basic');
		it('Escapes HTML entities in normal group names', function() {
			table = $('#example').DataTable({
				order: [[2, 'asc']],
				rowGroup: {
					dataSrc: function(row, type) {
						return 'A & B <Company>';
					}
				}
			});

			// Verify entities are properly escaped
			var groupRow = $('#example tbody tr:eq(0) th');
			expect(groupRow.text()).toBe('A & B <Company>');
		});

		dt.html('basic');
		it('Handles null and undefined group values safely', function() {
			table = $('#example').DataTable({
				order: [[2, 'asc']],
				rowGroup: {
					dataSrc: function(row, type) {
						return null;
					}
				}
			});

			// Should not throw an error and should handle gracefully
			expect($('#example tbody tr').length).toBeGreaterThan(0);
		});
	});
});
