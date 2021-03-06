import { Component, ChangeDetectorRef } from "@angular/core";

import { AccountingReportsBLService } from "../shared/accounting-reports.bl.service";
import GridColumnSettings from '../../../shared/danphe-grid/grid-column-settings.constant';
import { GridEmitModel } from "../../../shared/danphe-grid/grid-emit.model";

import * as moment from 'moment/moment';
import { MessageboxService } from "../../../shared/messagebox/messagebox.service";
import { Voucher } from "../../transactions/shared/voucher"
import { AccountingBLService } from "../../shared/accounting.bl.service"

@Component({
    selector: 'voucher-report',
    templateUrl: './voucher-report.html',
})
export class VoucherReportComponent {
    public txnList: Array<{ FiscalYear, TransactionDate, VoucherType }> = [];
    public txnListAll: Array<{ FiscalYear, TransactionDate, VoucherType }> = [];
    public txnGridColumns: Array<any> = null;
    public transactionId: number = null;
    public fromDate: string = null;
    public toDate: string = null;
    public voucherList: Array<Voucher> = new Array<Voucher>();
    public selVoucher: Voucher = new Voucher();
    public voucherNumber: string = null;
    public fiscalyearList: any;
    constructor(public accReportBLService: AccountingReportsBLService, public msgBoxServ: MessageboxService,
        public accountingBLService: AccountingBLService,
        public changeDetector: ChangeDetectorRef) {
        this.txnGridColumns = GridColumnSettings.VoucherTransactionList;
        this.fromDate = moment().format("YYYY-MM-DD");
        this.toDate = moment().format("YYYY-MM-DD");
        this.GetVoucher();
        this.GetFiscalYearList();
    }
    public GetFiscalYearList() {
        this.accReportBLService.GetFiscalYearsList()
            .subscribe(res => {
                if (res.Status == "OK") {
                    this.fiscalyearList = res.Results;
                    //this.currentFiscalYear = this.fiscalyearList.find(x => x.IsActive == true);
                }
                else {
                    this.msgBoxServ.showMessage("failed", [res.ErrorMessage]);
                }

            });
    }
    GetVoucher() {
        try {
            this.accountingBLService.GetVoucher()
                .subscribe(res => {
                    this.voucherList = res.Results;
                    this.selVoucher = Object.assign(this.selVoucher, this.voucherList.find(v => v.VoucherName == "Journal Voucher"));//most used voucher
                    this.AssignVoucher();
                });
        } catch (ex) {
            this.msgBoxServ.showMessage("error", ['error ! console log for details.']);
            console.log(ex);
        }
    }
    public GetTxnList() {
        if (this.checkDateValidation()) {
            this.accReportBLService.GetVoucherReport(this.fromDate, this.toDate)
                .subscribe(res => {
                    if (res.Status == "OK" && res.Results.length) {
                        this.txnListAll = res.Results;
                        this.AssignVoucher();
                        //this.txnList = res.Results;
                    }
                    else {
                        this.msgBoxServ.showMessage("notice", ["no record found."]);
                        // alert("Failed ! " + res.ErrorMessage);
                    }
                });
        }
    }

    checkDateValidation() {
        var frmdate = moment(this.fromDate, "YYYY-MM-DD");
        var tdate = moment(this.toDate, "YYYY-MM-DD");
        var flg = false;
        this.fiscalyearList.forEach(a => {
            if ((moment(a.StartDate, 'YYYY-MM-DD') <= frmdate) && (tdate <= moment(a.EndDate, 'YYYY-MM-DD'))) {
                flg = true;
            }
        });
        if (flg == false) {
            this.msgBoxServ.showMessage("error", ['Selected dates must be with in a fiscal year']);
            return flg;
        }
        let flag = true;
        flag = moment(this.fromDate, "YYYY-MM-DD").isValid() == true ? flag : false;
        flag = moment(this.toDate, "YYYY-MM-DD").isValid() == true ? flag : false;
        flag = (this.toDate >= this.fromDate) == true ? flag : false;
        //flag = (this.selVoucher.VoucherId > 0) ? flag : false;
        if (!flag) {
            this.msgBoxServ.showMessage("error", ['select proper date(FromDate <= ToDate)']);
        }
        return flag;
    }
    TransactionGridActions($event: GridEmitModel) {
        switch ($event.Action) {
            case "view-detail": {
                //this.transactionId = null;
                //this.changeDetector.detectChanges();
                //this.transactionId = $event.Data.TransactionId;
                this.voucherNumber = null;
                this.changeDetector.detectChanges();
                this.voucherNumber = $event.Data.VoucherNumber;
            }
            default:
                break;
        }
    }

    AssignVoucher() {
        try {
            this.selVoucher.VoucherName = (this.selVoucher.VoucherId == -1) ? "" : this.voucherList.find(v => v.VoucherId == this.selVoucher.VoucherId).VoucherName;
            this.txnList = [];
            this.txnList = (this.selVoucher.VoucherId == -1) ? this.txnListAll : this.txnListAll.filter(s => s.VoucherType == this.selVoucher.VoucherName);
        } catch (ex) {
            this.msgBoxServ.showMessage("error", ['Please check console']);
            console.log(ex);
        }
    }
}
