describe('RowGroup - rowGroup().disable()', function() {
	let table;

	dt.libs({
		js: ['jquery', 'datatables', 'rowgroup'],
		css: ['datatables', 'rowgroup']
	});

	describe('Check the defaults', function() {
		dt.html('basic');
		it('Exists and is a function', function() {
			table = $('#example').DataTable();
			expect(typeof table.rowGroup().disable).toBe('function');
		});
		it('Returns an API instance', function() {
			expect(table.rowGroup().disable() instanceof $.fn.dataTable.Api).toBe(true);
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
		});

		it('Does not redraw automatically', function() {
			table.rowGroup().disable();

			expect($('#example tbody tr:eq(0) td:eq(0)').html()).toBe('Edinburgh');
			expect($('#example tbody tr:eq(1) td:eq(0)').html()).toBe('Tiger Nixon');
		});

		it('Disabled after a redraw', function() {
			table.draw();

			expect($('#example tbody tr:eq(0) td:eq(0)').html()).toBe('Tiger Nixon');
		});
	});
});
