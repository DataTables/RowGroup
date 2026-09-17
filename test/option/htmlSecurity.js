describe('RowGroup - HTML Security', function() {
	var table;

	dt.libs({
		js: ['jquery', 'datatables', 'rowgroup'],
		css: ['datatables', 'rowgroup']
	});

	describe('XSS Prevention', function() {
		dt.html('basic');
		it('Escapes an <img onerror> payload found in the grouping data cell', function() {
			table = $('#example').DataTable({
				data: [
					['Tiger Nixon', 'System Architect', '<img src=x onerror=alert(1)>', 61, '2011/04/25', '$320,800'],
					['Garrett Winters', 'Accountant', '<img src=x onerror=alert(1)>', 63, '2011/07/25', '$170,750']
				],
				rowGroup: {
					dataSrc: 2
				}
			});

			// Verify the HTML is escaped (rendered as text, not executed)
			var groupRow = $('#example tbody tr:eq(0) th');
			expect(groupRow.text()).toBe('<img src=x onerror=alert(1)>');
			// Verify no img element was created (HTML was escaped)
			expect(groupRow.find('img').length).toBe(0);
		});

		dt.html('basic');
		it('Escapes a <script> tag payload found in the grouping data cell', function() {
			table = $('#example').DataTable({
				data: [
					['Tiger Nixon', 'System Architect', '<script>alert("XSS")</script>', 61, '2011/04/25', '$320,800']
				],
				rowGroup: {
					dataSrc: 2
				}
			});

			// Verify the script tag is escaped and displayed as text
			var groupRow = $('#example tbody tr:eq(0) th');
			expect(groupRow.text()).toBe('<script>alert("XSS")</script>');
			// Verify no script element was created
			expect(groupRow.find('script').length).toBe(0);
		});

		dt.html('basic');
		it('Escapes an event-handler attribute payload found in the grouping data cell', function() {
			table = $('#example').DataTable({
				data: [
					['Tiger Nixon', 'System Architect', '<div onload=alert(1)>Test</div>', 61, '2011/04/25', '$320,800']
				],
				rowGroup: {
					dataSrc: 2
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
		it('Escapes HTML entities in a normal-looking grouping data cell', function() {
			table = $('#example').DataTable({
				data: [
					['Tiger Nixon', 'System Architect', 'A & B <Company>', 61, '2011/04/25', '$320,800']
				],
				rowGroup: {
					dataSrc: 2
				}
			});

			// Verify entities are properly escaped
			var groupRow = $('#example tbody tr:eq(0) th');
			expect(groupRow.text()).toBe('A & B <Company>');
		});

		dt.html('basic');
		it('Handles a null grouping data cell safely', function() {
			table = $('#example').DataTable({
				data: [
					['Tiger Nixon', 'System Architect', null, 61, '2011/04/25', '$320,800']
				],
				rowGroup: {
					dataSrc: 2
				}
			});

			// Should not throw an error and should handle gracefully
			expect($('#example tbody tr').length).toBeGreaterThan(0);
		});
	});
});
