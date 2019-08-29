describe('RowGroup - rowGroup.emptyDataGroup', function() {
	var table;

	dt.libs({
		js: ['jquery', 'datatables', 'rowgroup'],
		css: ['datatables', 'rowgroup']
	});

	dt.html('empty');
	it('Check default', function() {
		expect($.fn.dataTable.RowGroup.defaults.emptyDataGroup).toBe('No group');
	});
	it('Default value when run', function() {
		table = $('#example').DataTable({
			columns: [
				{ data: 'name' },
				{ data: 'position' },
				{ data: 'office' },
				{ data: 'age' },
				{ data: 'start_date' },
				{ data: 'salary' }
			],
			rowGroup: {
				dataSrc: 'salary'
			}
		});

		table.row
			.add({ name: 'name1', position: 'position1', office: 'office1', age: 'age1', start_date: 'date1', salary: '' })
			.draw();

		expect($('tr.dtrg-group').text()).toBe('No group');
	});

	dt.html('empty');
	it('Can modify', function() {
		table = $('#example').DataTable({
			columns: [
				{ data: 'name' },
				{ data: 'position' },
				{ data: 'office' },
				{ data: 'age' },
				{ data: 'start_date' },
				{ data: 'salary' }
			],
			rowGroup: {
				dataSrc: 'salary',
				emptyDataGroup: 'unit_test'
			}
		});

		table.row
			.add({ name: 'name1', position: 'position1', office: 'office1', age: 'age1', start_date: 'date1', salary: '' })
			.draw();

		expect($('tr.dtrg-group').text()).toBe('unit_test');
	});

	dt.html('empty');
	it('No group shown if set to null', function() {
		table = $('#example').DataTable({
			columns: [
				{ data: 'name' },
				{ data: 'position' },
				{ data: 'office' },
				{ data: 'age' },
				{ data: 'start_date' },
				{ data: 'salary' }
			],
			rowGroup: {
				dataSrc: 'salary',
				emptyDataGroup: null
			}
		});

		table.row
			.add({ name: 'name1', position: 'position1', office: 'office1', age: 'age1', start_date: 'date1', salary: '' })
			.draw();

		expect($('tr.dtrg-group').length).toBe(0);
	});
});
