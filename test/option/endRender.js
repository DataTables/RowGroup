describe('RowGroup - End render', function() {
	var table;

	dt.libs({
		js: ['jquery', 'datatables', 'rowgroup'],
		css: ['datatables', 'rowgroup']
	});

	dt.html('basic');

	it('Default is null', function() {
		expect($.fn.dataTable.RowGroup.defaults.endRender).toBe(null);
	});

	it('Can be used to show the grouping data name', function() {
		table = $('#example').DataTable({
			order: [[2, 'asc']],
			rowGroup: {
				dataSrc: 2,
				endRender: function(rows, group) {
					return group;
				}
			}
		});

		expect($('#example tbody tr:eq(10)').text()).toBe('Edinburgh');
		expect($('#example tbody tr:eq(13)').text()).toBe('London');
	});

	dt.html('basic');

	it('Will show a static value', function() {
		table = $('#example').DataTable({
			order: [[2, 'asc']],
			rowGroup: {
				dataSrc: 2,
				endRender: function(rows, group) {
					return 'Test';
				}
			}
		});

		expect($('#example tbody tr:eq(10)').text()).toBe('Test');
		expect($('#example tbody tr:eq(13)').text()).toBe('Test');
	});

	dt.html('basic');

	var a1 = [];
	var a2 = [];

	it('Renderer is called with two arguments', function() {
		var args;

		table = $('#example').DataTable({
			order: [[2, 'asc']],
			rowGroup: {
				dataSrc: 2,
				endRender: function(rows, group, level) {
					a1.push(rows);
					a2.push(group);
					args = arguments.length;
					return group;
				}
			}
		});

		expect(args).toBe(3);
	});

	it('Is called once for each group on the page', function() {
		expect(a1.length).toBe(2);
	});

	it('First argument is an API instance', function() {
		expect(a1[0] instanceof $.fn.dataTable.Api).toBe(true);
	});

	it('First argument has the rows for the group in it', function() {
		expect(a1[0].count()).toBe(9);
		expect(a1[1].count()).toBe(1);
	});

	it('Second argument has the group name', function() {
		expect(a2[0]).toBe('Edinburgh');
		expect(a2[1]).toBe('London');
	});

	dt.html('basic');
	it('Correct callback when multi-level', function() {
		var allRows = [];
		var allGroups = [];
		var allLevels = [];

		table = $('#example').DataTable({
			order: [[2, 'asc'], [3, 'asc']],
			rowGroup: {
				dataSrc: [2, 3],
				endRender: function(rows, group, level) {
					allRows.push(rows[0]);
					allGroups.push(group);
					allLevels.push(level);
					return group;
				}
			}
		});

		expect(JSON.stringify(allRows)).toBe(
			JSON.stringify([[3, 11, 9, 19, 25, 49, 34, 54, 0], [3, 11], [9], [19], [25], [49], [34], [54], [0], [14], [14]])
		);
		expect(JSON.stringify(allGroups)).toBe(
			JSON.stringify(['Edinburgh', '22', '23', '35', '42', '43', '46', '51', '61', 'London', '19'])
		);
		expect(JSON.stringify(allLevels)).toBe(JSON.stringify([0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1]));
		expect($('#example tbody tr').length).toBe(32);
	});	
});
