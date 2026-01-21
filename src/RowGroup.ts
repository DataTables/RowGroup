import DataTable, { Api, Context, Dom } from 'datatables.net';
import { Config, DataSrc, Defaults, Grouping, Settings } from './interface';

if (!DataTable || !DataTable.versionCheck || !DataTable.versionCheck('3')) {
	throw new Error('RowGroup requires DataTables 3 or newer');
}

const dom = DataTable.dom;
const util = DataTable.util;

export default class RowGroup {
	static defaults: Defaults = {
		/**
		 * Class to apply to grouping rows - applied to both the start and
		 * end grouping rows.
		 * @type string
		 */
		className: 'dtrg-group',

		/**
		 * Data property from which to read the grouping information
		 * @type string|integer|array
		 */
		dataSrc: 0,

		/**
		 * Text to show if no data is found for a group
		 * @type string
		 */
		emptyDataGroup: 'No group',

		/**
		 * Initial enablement state
		 * @boolean
		 */
		enable: true,

		/**
		 * Class name to give to the end grouping row
		 * @type string
		 */
		endClassName: 'dtrg-end',

		/**
		 * End grouping label function
		 * @function
		 */
		endRender: null,

		/**
		 * Class name to give to the start grouping row
		 * @type string
		 */
		startClassName: 'dtrg-start',

		/**
		 * Start grouping label function
		 * @function
		 */
		startRender(rows, group, level) {
			return group;
		}
	};

	static version = '1.6.0';

	/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
	 * API methods for DataTables API interface
	 */

	/**
	 * Get/set the grouping data source - need to call draw after this is
	 * executed as a setter
	 *
	 * @returns string~RowGroup
	 */
	public dataSrc(val: DataSrc) {
		if (val === undefined) {
			return this.c.dataSrc;
		}

		var dt = this.s.dt;

		this.c.dataSrc = val;

		dom.s(dt.table().node()).trigger('rowgroup-datasrc.dt', false, [
			dt,
			val
		]);

		return this;
	}

	/**
	 * Disable - need to call draw after this is executed
	 *
	 * @returns RowGroup
	 */
	public disable() {
		this.c.enable = false;
		return this;
	}

	/**
	 * Enable - need to call draw after this is executed
	 *
	 * @returns RowGroup
	 */
	public enable(flag?: boolean) {
		if (flag === false) {
			return this.disable();
		}

		this.c.enable = true;
		return this;
	}

	/**
	 * Get enabled flag
	 * @returns boolean
	 */
	public enabled() {
		return this.c.enable;
	}

	/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
	 * Properties
	 */
	private c: Defaults;
	private s: Settings;

	/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
	 * Constructor
	 */
	constructor(dt: Api | Context, opts?: Config) {
		// Sanity check

		// User and defaults configuration object
		this.c = util.object.assignDeep(
			{},
			DataTable.defaults.rowGroup,
			RowGroup.defaults,
			opts
		);

		// Internal settings
		this.s = {
			dt: new DataTable.Api(dt)
		};

		// Check if row grouping has already been initialised on this table
		var settings = this.s.dt.settings()[0];
		var existing = settings.rowGroup;
		if (existing) {
			return existing;
		}

		settings.rowGroup = this;
		this._init();
	}

	private _init() {
		var that = this;
		var dt = this.s.dt;
		var hostSettings = dt.settings()[0];
		var scroller = dom.s(dt.table().container()).find('div.dt-scroll-body');

		dt.on('draw.dtrg', function (e, s) {
			if (that.c.enable && hostSettings === s) {
				that._draw();

				// Restore scrolling position if set and paging wasn't reset
				if (scrollTop && scroller.scrollTop()) {
					scroller.scrollTop(scrollTop);
					scrollTop = null;
				}
			}
		});

		dt.on(
			'column-visibility.dt.dtrg responsive-resize.dt.dtrg',
			function () {
				that._adjustColspan();
			}
		);

		dt.on('destroy', function () {
			dt.off('.dtrg');
		});

		// When scrolling is enabled, when adding grouping rows above the
		// scrolling view port, the browser (both FF and Chrome) will put the
		// element in and adjust the scrollTop so that it doesn't move the
		// current viewport. This isn't what we want since prior to the draw the
		// grouping elements were in place, but they then are removed and
		// reinserted. So we need to shift the scrollTop back to what it was!
		var scrollTop: null | number = null;

		if (scroller.count()) {
			dt.on('preDraw', function () {
				scrollTop = scroller.scrollTop();
			});
		}
	}

	/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
	 * Private methods
	 */

	/**
	 * Adjust column span when column visibility changes
	 */
	private _adjustColspan() {
		let cells = dom
			.s(this.s.dt.table().body())
			.find('tr.' + this.c.className)
			.find('th:visible, td:visible');

		// Only perform the adjust if there is a single cell. If there is more
		// the renderer must have returned multiple cells and it is the
		// responsibility of the rendering function to get the number of cells
		// right.
		if (cells.count() === 1) {
			cells.attr('colspan', this._colspan());
		}
	}

	/**
	 * Get the number of columns that a grouping row should span
	 */
	private _colspan() {
		return this.s.dt.columns(':visible').count();
	}

	/**
	 * Update function that is called whenever we need to draw the grouping rows.
	 * This is basically a bootstrap for the self iterative _group and _groupDisplay
	 * methods
	 */
	private _draw() {
		var dt = this.s.dt;

		// Don't do anything if there is no data source
		if (
			this.c.dataSrc === null ||
			(Array.isArray(this.c.dataSrc) && this.c.dataSrc.length === 0)
		) {
			return;
		}

		var groupedRows = this._group(
			0,
			dt.rows({ page: 'current' }).indexes().toArray()
		);

		this._groupDisplay(0, groupedRows);
	}

	/**
	 * Get the grouping information from a data set (index) of rows
	 *
	 * @param level Nesting level
	 * @param rows API of the rows to consider for this group
	 * @returns Nested grouping information
	 */
	private _group(level: number, rows: number[]): Grouping[] {
		var fns = Array.isArray(this.c.dataSrc)
			? this.c.dataSrc
			: [this.c.dataSrc];
		var fn = DataTable.util.get(fns[level]);
		var dt = this.s.dt;
		var group, last;
		var i, ien;
		var data: Grouping[] = [];
		var that = this;

		for (i = 0, ien = rows.length; i < ien; i++) {
			var rowIndex = rows[i];
			var rowData = dt.row(rowIndex).data();

			group = fn(rowData, level as any);

			if (group === null || group === undefined) {
				group = that.c.emptyDataGroup;
			}

			if (last === undefined || group !== last) {
				data.push({
					dataPoint: group,
					rows: []
				});

				last = group;
			}

			data[data.length - 1].rows.push(rowIndex);
		}

		if (fns[level + 1] !== undefined) {
			for (i = 0, ien = data.length; i < ien; i++) {
				data[i].children = this._group(level + 1, data[i].rows);
			}
		}

		return data;
	}

	/**
	 * Row group display - insert the rows into the document
	 *
	 * @param level Nesting level
	 * @param groups Takes the nested array from `_group`
	 */
	private _groupDisplay(level: number, groups: Grouping[]) {
		var dt = this.s.dt;
		var display;

		for (var i = 0, ien = groups.length; i < ien; i++) {
			var group = groups[i];
			var groupName = group.dataPoint;
			var row;
			var rows = group.rows;

			if (this.c.startRender) {
				display = this.c.startRender.call(
					this,
					dt.rows(rows),
					groupName,
					level
				);
				row = this._rowWrap(display, this.c.startClassName, level);

				if (row) {
					row.insertBefore(dt.row(rows[0]).node()!);
				}
			}

			if (this.c.endRender) {
				display = this.c.endRender.call(
					this,
					dt.rows(rows),
					groupName,
					level
				);
				row = this._rowWrap(display, this.c.endClassName, level);

				if (row) {
					row.insertAfter(dt.row(rows[rows.length - 1]).node()!);
				}
			}

			if (group.children) {
				this._groupDisplay(level + 1, group.children);
			}
		}
	}

	/**
	 * Take a rendered value from an end user and make it suitable for display
	 * as a row, by wrapping it in a row, or detecting that it is a row.
	 *
	 * @param display Display value
	 * @param className Class to add to the row
	 * @param group level
	 */
	private _rowWrap(
		display: HTMLElement | Dom | string | null,
		className: string,
		level: number
	) {
		var row;

		if (display === null || display === '') {
			display = this.c.emptyDataGroup;
		}

		if (display === undefined || display === null) {
			return null;
		}

		if (
			util.is.element(display) &&
			display.nodeName.toLowerCase() === 'tr'
		) {
			row = dom.s(display);
		}
		else if (
			util.is.dom(display) &&
			display.count() &&
			display.get(0).nodeName.toLowerCase() === 'tr'
		) {
			row = display;
		}
		else {
			let cell = dom
				.c('th')
				.attr('colspan', this._colspan())
				.attr('scope', 'row');

			if (typeof display === 'string') {
				cell.html(display);
			}
			else {
				cell.append(display);
			}

			row = dom.c('tr').append(cell);
		}

		return row
			.classAdd(this.c.className)
			.classAdd(className)
			.classAdd('dtrg-level-' + level);
	}
}
