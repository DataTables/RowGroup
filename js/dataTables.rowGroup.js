/*! RowGroup 1.6.0
 * © SpryMedia Ltd - datatables.net/license
 */

/**
 * @summary     RowGroup
 * @description RowGrouping and data aggregation for DataTables
 * @version     1.6.0
 * @author      SpryMedia Ltd (www.sprymedia.co.uk)
 * @contact     datatables.net
 * @copyright   SpryMedia Ltd.
 *
 * This source file is free software, available under the following license:
 *   MIT license - http://datatables.net/license/mit
 *
 * This source file is distributed in the hope that it will be useful, but
 * WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY
 * or FITNESS FOR A PARTICULAR PURPOSE. See the license files for details.
 *
 * For details please refer to: http://www.datatables.net
 */

var RowGroup = function (dt, opts) {
	// Sanity check that we are using DataTables 1.10 or newer
	if (!DataTable.versionCheck || !DataTable.versionCheck('1.11')) {
		throw 'RowGroup requires DataTables 1.11 or newer';
	}

	// User and defaults configuration object
	this.c = $.extend(true, {}, DataTable.defaults.rowGroup, RowGroup.defaults, opts);

	// Internal settings
	this.s = {
		dt: new DataTable.Api(dt)
	};

	// DOM items
	this.dom = {};

	// Check if row grouping has already been initialised on this table
	var settings = this.s.dt.settings()[0];
	var existing = settings.rowGroup;
	if (existing) {
		return existing;
	}

	settings.rowGroup = this;
	this._constructor();
};

$.extend(RowGroup.prototype, {
	/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
	 * API methods for DataTables API interface
	 */

	/**
	 * Get/set the grouping data source - need to call draw after this is
	 * executed as a setter
	 * @returns string~RowGroup
	 */
	dataSrc: function (val) {
		if (val === undefined) {
			return this.c.dataSrc;
		}

		var dt = this.s.dt;

		this.c.dataSrc = val;

		$(dt.table().node()).triggerHandler('rowgroup-datasrc.dt', [dt, val]);

		return this;
	},

	/**
	 * Get/set padding left value (default) - need to call draw after this is
	 * executed as a setter
	 * @returns string~RowGroup
	 */
	aggPaddingLeft: function (val) {
		if (val === undefined) {
			return this.c.aggPaddingLeft;
		}

		this.c.aggPaddingLeft = val;

		return this;
	},

	/**
	 * Get/set padding right value (default) - need to call draw after this is
	 * executed as a setter
	 * @returns string~RowGroup
	 */
	aggPaddingRight: function (val) {
		if (val === undefined) {
			return this.c.aggPaddingRight;
		}

		this.c.aggPaddingRight = val;

		return this;
	},

	/**
	 * Get/set text alignment (default) - need to call draw after this is
	 * executed as a setter
	 * @returns string~RowGroup
	 */
	aggTextAlign: function (val) {
		if (val === undefined) {
			return this.c.aggTextAlign;
		}

		this.c.aggTextAlign = val;

		return this;
	},

	/**
	 * Get/set number of displayed decimal places (default) - need to call draw after this is
	 * executed as a setter
	 * @returns string~integer~RowGroup
	 */
	aggDecimalPlaces: function (val) {
		if (val === undefined) {
			return this.c.aggDecimalPlaces;
		}

		this.c.aggDecimalPlaces = val;

		return this;
	},

	/**
	 * Get/set whether to show trailing zeros (default) - need to call draw after this is
	 * executed as a setter
	 * @returns boolean~RowGroup
	 */
	aggShowTrailingZeros: function (val) {
		if (val === undefined) {
			return this.c.aggShowTrailingZeros;
		}

		this.c.aggShowTrailingZeros = val;

		return this;
	},

	/**
	 * Disable - need to call draw after this is executed
	 * @returns RowGroup
	 */
	disable: function () {
		this.c.enable = false;
		return this;
	},

	/**
	 * Enable - need to call draw after this is executed
	 * @returns RowGroup
	 */
	enable: function (flag) {
		if (flag === false) {
			return this.disable();
		}

		this.c.enable = true;
		return this;
	},

	/**
	 * Get enabled flag
	 * @returns boolean
	 */
	enabled: function () {
		return this.c.enable;
	},

	/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
	 * Constructor
	 */
	_constructor: function () {
		var that = this;
		var dt = this.s.dt;
		var hostSettings = dt.settings()[0];

		dt.on('draw.dtrg', function (e, s) {
			if (that.c.enable && hostSettings === s) {
				that._draw();
			}
		});

		dt.on('column-visibility.dt.dtrg responsive-resize.dt.dtrg', function () {
			that._adjustColspan();
		});

		dt.on('destroy', function () {
			dt.off('.dtrg');
		});
	},

	/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
	 * Private methods
	 */

	/**
	 * Adjust column span when column visibility changes
	 * @private
	 */
	_adjustColspan: function () {
		$('tr.' + this.c.className, this.s.dt.table().body())
			.find('th:visible, td:visible')
			.attr('colspan', this._colspan());
	},

	/**
	 * Get the number of columns that a grouping row should span
	 * @private
	 */
	_colspan: function () {
		return this.s.dt
			.columns()
			.visible()
			.reduce(function (a, b) {
				return a + b;
			}, 0);
	},

	/**
	 * Update function that is called whenever we need to draw the grouping rows.
	 * This is basically a bootstrap for the self iterative _group and _groupDisplay
	 * methods
	 * @private
	 */
	_draw: function () {
		var dt = this.s.dt;
		var groupedRows = this._group(0, dt.rows({ page: 'current' }).indexes());

		this._groupDisplay(0, groupedRows);
	},

	/**
	 * Get the grouping information from a data set (index) of rows
	 * @param {number} level Nesting level
	 * @param {DataTables.Api} rows API of the rows to consider for this group
	 * @returns {object[]} Nested grouping information - it is structured like this:
	 *	{
	 *		dataPoint: 'Edinburgh',
	 *		rows: [ 1,2,3,4,5,6,7 ],
	 *		children: [ {
	 *			dataPoint: 'developer'
	 *			rows: [ 1, 2, 3 ]
	 *		},
	 *		{
	 *			dataPoint: 'support',
	 *			rows: [ 4, 5, 6, 7 ]
	 *		} ]
	 *	}
	 * @private
	 */
	_group: function (level, rows) {
		var fns = Array.isArray(this.c.dataSrc) ? this.c.dataSrc : [this.c.dataSrc];
		var fn = DataTable.util.get(fns[level]);
		var dt = this.s.dt;
		var group, last;
		var i, ien;
		var data = [];
		var that = this;

		for (i = 0, ien = rows.length; i < ien; i++) {
			var rowIndex = rows[i];
			var rowData = dt.row(rowIndex).data();

			group = fn(rowData, level);

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
	},

	/**
	 * Row group display - insert the rows into the document
	 * @param {number} level Nesting level
	 * @param {object[]} groups Takes the nested array from `_group`
	 * @private
	 */
	_groupDisplay: function (level, groups) {
		var dt = this.s.dt;
		var display;

		for (var i = 0, ien = groups.length; i < ien; i++) {
			var group = groups[i];
			var groupName = group.dataPoint;
			var row;
			var rows = group.rows;

			// Aggregation logic
			var aggregation = {
				values: {},
				skipped: []
			};

			for(var colIndex = 0; colIndex < dt.columns()[0].length; colIndex++) {
				var column = dt.column(colIndex);
				var columnSettings = column.settings()[0].aoColumns[colIndex];
				var aggValue;

				if (!columnSettings.bVisible) {
					aggregation.skipped.push(colIndex);
					continue;
				}

				var aggFunc = columnSettings.aggFunc;
				if (aggFunc) {
					var decimalPlaces = columnSettings.aggDecimalPlaces ?? this.c.aggDecimalPlaces;
					var showTrailingZeros = columnSettings.aggShowTrailingZeros ?? this.c.aggShowTrailingZeros;

					aggValue = this._aggregateData(rows, aggFunc, colIndex, decimalPlaces, showTrailingZeros);
					if (aggValue !== null) {
						aggregation.values[colIndex] = aggValue;
					}
				}
			}

			if (this.c.startRender) {
				display = this.c.startRender.call(this, dt.rows(rows), groupName, level);
				row = this._rowWrap(display, this.c.startClassName, level, aggregation);

				if (row) {
					row.insertBefore(dt.row(rows[0]).node());
				}
			}

			if (this.c.endRender) {
				display = this.c.endRender.call(this, dt.rows(rows), groupName, level);
				row = this._rowWrap(display, this.c.endClassName, level, aggregation);

				if (row) {
					row.insertAfter(dt.row(rows[rows.length - 1]).node());
				}
			}

			if (group.children) {
				this._groupDisplay(level + 1, group.children);
			}
		}
	},

	/**
	 * Take a rendered value from an end user and make it suitable for display
	 * as a row, by wrapping it in a row, or detecting that it is a row.
	 * @param {node|jQuery|string} display Display value
	 * @param {string} className Class to add to the row
	 * @param {number} level
	 * @param {object[]} aggregation Object containing aggregation results
	 * @private
	 */
	_rowWrap: function (display, className, level, aggregation = null) {
		var dt = this.s.dt;
		var row;

		if (display === null || display === '') {
			display = this.c.emptyDataGroup;
		}

		if (display === undefined || display === null) {
			return null;
		}

		if (
			typeof display === 'object' &&
			display.nodeName &&
			display.nodeName.toLowerCase() === 'tr'
		) {
			row = $(display);
		}
		else if (
			display instanceof $ &&
			display.length &&
			display[0].nodeName.toLowerCase() === 'tr'
		) {
			row = display;
		}
		else if (aggregation && !$.isEmptyObject(aggregation.values)) {
			row = $('<tr/>');
			var lastColIndex = -1;
			var th;

			var gapWidth;
			var skippedCount;
			var emptyColspan;

			var groupNameAdded = false;

			// Check every column if it has an aggregation value
			for (var [colIndex, aggValue] of Object.entries(aggregation.values)) {
				if (aggValue !== null) {
					colIndex = parseInt(colIndex); // Convert colIndex to integer

					// If there is a gap between columns with aggregation values, append empty th
					if ((lastColIndex + 1) !== colIndex) {
						gapWidth = colIndex - lastColIndex - 1;
						skippedCount = aggregation.skipped.filter(index => index > lastColIndex && index < colIndex).length;
						emptyColspan = gapWidth - skippedCount;

						if (emptyColspan > 0) {
							th = $('<th/>').attr('scope', 'row');
							// Adding colspan only if emptyColspan greater than 1, otherwise it's redundant
							if (emptyColspan > 1) {
								th.attr('colspan', emptyColspan);
							}
							// Add group name to first available th element
							if (!groupNameAdded) {
								th.append(display);
								groupNameAdded = true;
							}

							row.append(th);
						}
					}

					// Append the aggregation value
					row.append(
						$('<th/>').attr('scope', 'row').css({
							'text-align': this.c.aggTextAlign,
							'padding-left': this.c.aggPaddingLeft,
							'padding-right': this.c.aggPaddingRight,
						}).append(aggValue)
					);

					lastColIndex = colIndex;
				}
			}

			// Append trailing th element if needed at the end
			if (lastColIndex < dt.columns()[0].length - 1) {
				gapWidth = dt.columns.length - lastColIndex - 1;
				skippedCount = aggregation.skipped.filter(index => index > lastColIndex).length;
				emptyColspan = gapWidth - skippedCount;

				if (emptyColspan > 0) {
					th = $('<th/>').attr('scope', 'row');
					// Adding colspan only if emptyColspan greater than 1, otherwise it's redundant
					if (emptyColspan > 1) {
						th.attr('colspan', emptyColspan);
					}
					// Add group name to th element if not already added
					if (!groupNameAdded) {
						th.append(display);
						groupNameAdded = true;
					}

					row.append(th);
				}
			}
		}
		else {
			row = $('<tr/>').append(
				$('<th/>').attr('colspan', this._colspan()).attr('scope', 'row').append(display)
			);
		}

		return row
			.addClass(this.c.className)
			.addClass(className)
			.addClass('dtrg-level-' + level);
	},

	/**
	 * Get the aggregation result for a data set (index) of rows
	 * @param {DataTables.Api} rows API of the rows to consider for this aggregation
	 * @param {string|function} aggFunc name of aggregation function or custom function provided by the user
	 * @param {number} colIndex index of the column to aggregate
	 * @param {number} decimalPlaces number of decimal places to round to
	 * @param {boolean} showTrailingZeros whether to show trailing zeros in the result
	 * @returns {number|*} result of the aggregation
	 * @private
	 */
	_aggregateData: function(rows, aggFunc, colIndex, decimalPlaces = 2, showTrailingZeros = false) {
		var dt = this.s.dt;
		var columnKey = dt.settings()[0].aoColumns[colIndex].data;

		var data = dt.rows(rows).data().toArray();
		var result;

		if (typeof aggFunc === 'function') {
			// User defined aggregation function, can return any value
			result = aggFunc( data.map((row) => row[columnKey]) );
		} else {
			// Predefined aggregation functions
			switch (aggFunc) {
				case 'avg':
					var sum = data.reduce((acc, row) => {
						var value = parseFloat(row[columnKey]);
						return acc + (isNaN(value) ? 0 : value);
					}, 0);
					result = sum / data.length;
					break;
				case 'sum':
					result = data.reduce((acc, row) => {
						var value = parseFloat(row[columnKey]);
						return acc + (isNaN(value) ? 0 : value);
					}, 0);
					break;
				case 'count':
					result = data.length;
					break;
				case 'max':
					result = data.reduce((acc, row) => {
						var value = parseFloat(row[columnKey]);
						if (isNaN(value)) return acc;
						return acc === null || value > acc ? value : acc;
					}, null);
					break;
				case 'min':
					result = data.reduce((acc, row) => {
						var value = parseFloat(row[columnKey]);
						if (isNaN(value)) return acc;
						return acc === null || value < acc ? value : acc;
					}, null);
					break;
				default:
					result = null;
			}
		}

		if (!isNaN(parseFloat(result))) {
			result = parseFloat(result).toFixed(decimalPlaces);
			if (!showTrailingZeros) {
				result = parseFloat(result);
			}
		}

		return result;
	}
});

/**
 * RowGroup default settings for initialisation
 *
 * @namespace
 * @name RowGroup.defaults
 * @static
 */
RowGroup.defaults = {
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
	startRender: function (rows, group) {
		return group;
	},

	/**
	 * Grouping aggregation left padding value
	 * @type string
	 */
	aggPaddingLeft: '10px',

	/**
	 * Grouping aggregation right padding value
	 * @type string
	 */
	aggPaddingRight: '10px',

	/**
	 * Grouping aggregation default text alignment - can be redefined for each column as well
	 * @type string
	 */
	aggTextAlign: 'center',

	/**
	 * Grouping aggregation default decimal places count - can be redefined for each column as well
	 * @type string|integer
	 */
	aggDecimalPlaces: 2,

	/**
	 * Defines whether the aggregated values should show trailing zeros or not - can be redefined for each column as well
	 * @type boolean
	 */
	aggShowTrailingZeros: false
};

RowGroup.version = '1.6.0';

$.fn.dataTable.RowGroup = RowGroup;
$.fn.DataTable.RowGroup = RowGroup;

DataTable.Api.register('rowGroup()', function () {
	return this;
});

DataTable.Api.register('rowGroup().disable()', function () {
	return this.iterator('table', function (ctx) {
		if (ctx.rowGroup) {
			ctx.rowGroup.enable(false);
		}
	});
});

DataTable.Api.register('rowGroup().enable()', function (opts) {
	return this.iterator('table', function (ctx) {
		if (ctx.rowGroup) {
			ctx.rowGroup.enable(opts === undefined ? true : opts);
		}
	});
});

DataTable.Api.register('rowGroup().enabled()', function () {
	var ctx = this.context;

	return ctx.length && ctx[0].rowGroup ? ctx[0].rowGroup.enabled() : false;
});

DataTable.Api.register('rowGroup().dataSrc()', function (val) {
	if (val === undefined) {
		return this.context[0].rowGroup.dataSrc();
	}

	return this.iterator('table', function (ctx) {
		if (ctx.rowGroup) {
			ctx.rowGroup.dataSrc(val);
		}
	});
});

// Attach a listener to the document which listens for DataTables initialisation
// events so we can automatically initialise
$(document).on('preInit.dt.dtrg', function (e, settings, json) {
	if (e.namespace !== 'dt') {
		return;
	}

	var init = settings.oInit.rowGroup;
	var defaults = DataTable.defaults.rowGroup;

	if (init || defaults) {
		var opts = $.extend({}, defaults, init);

		if (init !== false) {
			new RowGroup(settings, opts);
		}
	}
});
