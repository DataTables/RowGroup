describe('RowGroup - rowGroup().enabled()', function() {
	let table;

	dt.libs({
		js: ['jquery', 'datatables', 'rowgroup'],
		css: ['datatables', 'rowgroup']
	});

	describe('Check the defaults', function() {
		dt.html('basic');
		it('Exists and is a function', function() {
			table = $('#example').DataTable();
			expect(typeof table.rowGroup().enable).toBe('function');
		});
		it('Returns a boolean', function() {
			expect(typeof table.rowGroup().enabled()).toBe('boolean');
		});
	});

	describe('Functional tests', function() {
		dt.html('basic');
		it('A DataTable can be created with RowGrouping', function() {
			table = $('#example').DataTable({
				order: [[2, 'asc']],
				rowGroup: {
					dataSrc: 2
				}
			});

			expect($('#example tbody tr:eq(0) td:eq(0)').html()).toBe('Edinburgh');
			expect($('#example tbody tr:eq(1) td:eq(0)').html()).toBe('Tiger Nixon');
			expect(table.rowGroup().enabled()).toBe(true);
		});

		it('Disable', function() {
			table
				.rowGroup()
				.disable()
				.draw();

			expect($('#example tbody tr:eq(0) td:eq(0)').html()).toBe('Tiger Nixon');
			expect(table.rowGroup().enabled()).toBe(false);
		});

		it('Can be enabled', function() {
			table
				.rowGroup()
				.enable()
				.draw();

			expect($('#example tbody tr:eq(0) td:eq(0)').html()).toBe('Edinburgh');
			expect($('#example tbody tr:eq(1) td:eq(0)').html()).toBe('Tiger Nixon');
			expect(table.rowGroup().enabled()).toBe(true);
		});
	});
});
