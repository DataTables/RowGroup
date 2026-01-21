import DataTable, { Context } from 'datatables.net';
import RowGroup from './RowGroup';
import './interface';
import { Config } from './interface';

const dom = DataTable.dom;
const util = DataTable.util;

DataTable.RowGroup = RowGroup;

DataTable.Api.register('rowGroup()', function () {
	return this.inst(this.context);
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
		let s = this.context[0].rowGroup;
		return s ? s.dataSrc() : [];
	}

	return this.iterator('table', function (ctx) {
		if (! ctx.rowGroup) {
			new RowGroup(this.context[0]);
		}
		
		ctx.rowGroup.dataSrc(val);
	});
});

// Attach a listener to the document which listens for DataTables initialisation
// events so we can automatically initialise
dom.s(document).on('preInit.dt.dtrg', function (e, settings: Context, json) {
	if (e.namespace !== 'dt') {
		return;
	}

	let init = settings.init.rowGroup;
	let defaults = DataTable.defaults.rowGroup;

	if (init || defaults) {
		let opts: Config = {};

		if (util.is.plainObject(defaults)) {
			util.object.assign(opts, defaults);
		}

		if (util.is.plainObject(init)) {
			util.object.assign(opts, init);
		}

		if (init !== false) {
			new RowGroup(settings, opts);
		}
	}
});
