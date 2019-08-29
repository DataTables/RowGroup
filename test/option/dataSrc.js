describe('RowGroup - dataSrc', function() {
	var table;

	dt.libs({
		js: ['jquery', 'datatables', 'rowgroup'],
		css: ['datatables', 'rowgroup']
	});

	dt.html('basic');
	it('Default is 0', function() {
		expect($.fn.dataTable.RowGroup.defaults.dataSrc).toBe(0);
	});

	it('Is indeed 0 when run', function() {
		table = $('#example').DataTable({
			rowGroup: true
		});

		expect($('#example tbody tr:eq(0)').text()).toBe('Airi Satou');
	});

	dt.html('basic');
	it('Can be used with object data', function() {
		table = $('#example').DataTable({
			order: [[2, 'asc']],
			columns: [
				{ data: 'name' },
				{ data: 'position' },
				{ data: 'office' },
				{ data: 'age' },
				{ data: 'startDate' },
				{ data: 'salary' }
			],
			rowGroup: {
				dataSrc: 'office'
			}
		});

		expect($('#example tbody tr:eq(0) td:eq(0)').html()).toBe('Edinburgh');
		expect($('#example tbody tr:eq(1) td:eq(0)').html()).toBe('Tiger Nixon');
		expect($('#example tbody tr').length).toBe(12);
	});

	dt.html('basic');
	it('Can be column number', function() {
		table = $('#example').DataTable({
			order: [[2, 'asc']],
			rowGroup: {
				dataSrc: 2
			}
		});

		expect($('#example tbody tr:eq(0) td:eq(0)').html()).toBe('Edinburgh');
		expect($('#example tbody tr:eq(1) td:eq(0)').html()).toBe('Tiger Nixon');
		expect($('#example tbody tr').length).toBe(12);
	});

	dt.html('empty');
	it('Works with Ajax loaded data', function(done) {
		table = $('#example').DataTable({
			ajax: '/base/test/data/data.txt',
			deferRender: true,
			columns: [
				{ data: 'name' },
				{ data: 'position' },
				{ data: 'office' },
				{ data: 'age' },
				{ data: 'start_date' },
				{ data: 'salary' }
			],
			order: [[2, 'asc']],
			rowGroup: {
				dataSrc: 'office'
			},
			initComplete: function(settings, json) {
				expect($('#example tbody tr:eq(0) td:eq(0)').html()).toBe('Edinburgh');
				expect($('#example tbody tr:eq(1) td:eq(0)').html()).toBe('Tiger Nixon');
				expect($('#example tbody tr').length).toBe(12);
				done();
			}
		});
	});

	dt.html('basic');
	it('Can be function', function() {
		table = $('#example').DataTable({
			order: [[3, 'asc']],
			rowGroup: {
				dataSrc: function(row) {
					var base = Math.floor(row[3] / 10);
					return '' + base + '0 - ' + base + '9';
				}
			}
		});

		expect($('#example tbody tr:eq(0)').text()).toBe('10 - 19');
		expect($('#example tbody tr:eq(1) td:eq(0)').text()).toBe('Tatyana Fitzpatrick');
		expect($('#example tbody tr').length).toBe(12);
	});

	dt.html('basic');
	it('Can be an array', function() {
		table = $('#example').DataTable({
			order: [[2, 'asc'], [3, 'asc']],
			rowGroup: {
				dataSrc: [2, 3]
			}
		});

		expect($('#example tbody tr:eq(0)').text()).toBe('Edinburgh');
		expect($('#example tbody tr:eq(1) td:eq(0)').text()).toBe('22');
		expect($('#example tbody tr:eq(2) td:eq(0)').text()).toBe('Cedric Kelly');

		expect($('#example tbody tr').length).toBe(21);
	});
});
