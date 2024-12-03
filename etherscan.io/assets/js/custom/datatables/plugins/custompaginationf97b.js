﻿(function ($) {
	function calcDisableClasses(oSettings) {
		var start = oSettings._iDisplayStart;
		var length = oSettings._iDisplayLength;
		var visibleRecords = oSettings.fnRecordsDisplay();
		var all = length === -1;

		// Gordey Doronin: Re-used this code from main jQuery.dataTables source code. To be consistent.
		var page = all ? 0 : Math.ceil(start / length);
		var pages = all ? 1 : Math.ceil(visibleRecords / length);

		var disableFirstPrevClass = (page > 0 ? '' : oSettings.oClasses.sPageButtonDisabled);
		var disableNextLastClass = (page < pages - 1 ? '' : oSettings.oClasses.sPageButtonDisabled);

		return {
			'first': disableFirstPrevClass,
			'previous': disableFirstPrevClass,
			'next': disableNextLastClass,
			'last': disableNextLastClass
		};
	}

	function calcCurrentPage(oSettings) {
		return Math.ceil(oSettings._iDisplayStart / oSettings._iDisplayLength) + 1;
	}

	function calcPages(oSettings) {
		return Math.ceil(oSettings.fnRecordsDisplay() / oSettings._iDisplayLength);
	}

	var firstClassName = 'first';
	var previousClassName = 'previous';
	var nextClassName = 'next';
	var lastClassName = 'last';

	var paginateClassName = 'paginate';
	var paginatePageClassName = 'paginate_page';
	var paginateInputClassName = 'paginate_input';
	var paginateTotalClassName = 'paginate_total';

	$.fn.dataTableExt.oPagination.custompagination = {
		'fnInit': function (oSettings, nPaging, fnCallbackDraw) {

			var nWrap = document.createElement("ul");
			var nFirst = document.createElement('li');
			var nPrevious = document.createElement('li');
			var nNext = document.createElement('li');
			var nLast = document.createElement('li');
			var nTotal = document.createElement('span');
			var nInfo = document.createElement('li');
			var nPage = document.createElement('span');
			var language = oSettings.oLanguage.oPaginate;
			var classes = oSettings.oClasses;
			var info = language.info || '<span class="page-link text-nowrap">Page _CURPAGE_ of _TOTAL_</span>';	

			nFirst.innerHTML = '<a href="#" aria-controls="' + oSettings.sTableId + '_' + firstClassName + '" class="page-link">' + language.sFirst + '</a>';
			nPrevious.innerHTML = '<a href="#" aria-controls="' + oSettings.sTableId + '_' + previousClassName + '" class="page-link px-3">' + language.previous +'</a>';
			nNext.innerHTML = '<a href="#" aria-controls="' + oSettings.sTableId + '_' + nextClassName + '" class="page-link px-3">'+ language.next +'</a>';
			nLast.innerHTML = '<a href="#" aria-controls="' + oSettings.sTableId + '_' + lastClassName + '" class="page-link">' + language.sLast + '</a>';

			nWrap.className = 'pagination pagination-sm mb-0';
			nFirst.className = firstClassName + ' ' + classes.sPageButton;
			nPrevious.className = previousClassName + ' ' + classes.sPageButton;
			nNext.className = nextClassName + ' ' + classes.sPageButton;
			nLast.className = lastClassName + ' ' + classes.sPageButton;

			nInfo.className = "page-item disabled";
			nPage.className = paginatePageClassName;
			nTotal.className = paginateTotalClassName;


			if (oSettings.sTableId !== '') {
				nPaging.setAttribute('id', oSettings.sTableId + '_' + paginateClassName);
				nFirst.setAttribute('id', oSettings.sTableId + '_' + firstClassName);
				nPrevious.setAttribute('id', oSettings.sTableId + '_' + previousClassName);
				nNext.setAttribute('id', oSettings.sTableId + '_' + nextClassName);
				nLast.setAttribute('id', oSettings.sTableId + '_' + lastClassName);
			}

			info = info.replace(/_CURPAGE_/g,  nPage.outerHTML );
			info = info.replace(/_TOTAL_/g,  nTotal.outerHTML);
			nInfo.innerHTML = info;

			nWrap.appendChild(nFirst);
			nWrap.appendChild(nPrevious);
			nWrap.appendChild(nInfo);
			nWrap.appendChild(nNext);
			nWrap.appendChild(nLast);

			nPaging.appendChild(nWrap);

			$(nFirst).click(function () {
				var iCurrentPage = calcCurrentPage(oSettings);
				if (iCurrentPage !== 1) {
					oSettings.oApi._fnPageChange(oSettings, 'first');
					fnCallbackDraw(oSettings);
				}
			});

			$(nPrevious).click(function () {
				var iCurrentPage = calcCurrentPage(oSettings);
				if (iCurrentPage !== 1) {
					oSettings.oApi._fnPageChange(oSettings, 'previous');
					fnCallbackDraw(oSettings);
				}
			});

			$(nNext).click(function () {
				var iCurrentPage = calcCurrentPage(oSettings);
				if (iCurrentPage !== calcPages(oSettings)) {
					oSettings.oApi._fnPageChange(oSettings, 'next');
					fnCallbackDraw(oSettings);
				}
			});

			$(nLast).click(function () {
				var iCurrentPage = calcCurrentPage(oSettings);
				if (iCurrentPage !== calcPages(oSettings)) {
					oSettings.oApi._fnPageChange(oSettings, 'last');
					fnCallbackDraw(oSettings);
				}
			});

			$(nPaging).find('.' + paginateInputClassName).keyup(function (e) {
				// 38 = up arrow, 39 = right arrow
				if (e.which === 38 || e.which === 39) {
					this.value++;
				}
				// 37 = left arrow, 40 = down arrow
				else if ((e.which === 37 || e.which === 40) && this.value > 1) {
					this.value--;
				}

				if (this.value === '' || this.value.match(/[^0-9]/) !== null) {
					/* Nothing entered or non-numeric character */
					this.value = this.value.replace(/[^\d]/g, ''); // don't even allow anything but digits

					if (this.value === '') {
						var iCurrentPage = calcCurrentPage(oSettings);
						this.value = iCurrentPage;
                    }
						
					return;
				}

				var iNewStart = oSettings._iDisplayLength * (this.value - 1);
				if (iNewStart < 0) {
					iNewStart = 0;
				}
				if (iNewStart >= oSettings.fnRecordsDisplay()) {
					iNewStart = (Math.ceil((oSettings.fnRecordsDisplay()) / oSettings._iDisplayLength) - 1) * oSettings._iDisplayLength;
				}

				oSettings._iDisplayStart = iNewStart;
				oSettings.oInstance.trigger("page.dt", oSettings);
				fnCallbackDraw(oSettings);
			});

			// Take the brutal approach to cancelling text selection.
			$('span', nPaging).bind('mousedown', function () { return false; });
			$('span', nPaging).bind('selectstart', function () { return false; });

			// If we can't page anyway, might as well not show it.
			var iPages = calcPages(oSettings);

			if (iPages <= 1) {
				$(nPaging).hide();
			}
			
		},

		'fnUpdate': function (oSettings) {
			if (!oSettings.aanFeatures.p) {
				return;
			}

			var iPages = calcPages(oSettings);
			var iCurrentPage = calcCurrentPage(oSettings);

			var an = oSettings.aanFeatures.p;
			if (iPages <= 1) // hide paging when we can't page
			{
				$(an).hide();
				return;
			}

			var disableClasses = calcDisableClasses(oSettings);

			$(an).show();

			
			var _newWidth = '45px';
			
		

			$(an).find('.' + paginateInputClassName)
				.width(_newWidth);
				

			// Enable/Disable `first` button.
			$(an).find('.' + firstClassName)
				.removeClass(oSettings.oClasses.sPageButtonDisabled)
				.addClass(disableClasses[firstClassName]);

			// Enable/Disable `prev` button.
			$(an).find('.' + previousClassName)
				.removeClass(oSettings.oClasses.sPageButtonDisabled)
				.addClass(disableClasses[previousClassName]);

			// Enable/Disable `next` button.
			$(an).find('.' + nextClassName)
				.removeClass(oSettings.oClasses.sPageButtonDisabled)
				.addClass(disableClasses[nextClassName]);

			// Enable/Disable `last` button.
			$(an).find('.' + lastClassName)
				.removeClass(oSettings.oClasses.sPageButtonDisabled)
				.addClass(disableClasses[lastClassName]);

			// Paginate of N pages text
			$(an).find('.' + paginateTotalClassName).html(iPages);

			$(an).find('.' + paginatePageClassName).html(iCurrentPage);

		}
	};
})(jQuery);