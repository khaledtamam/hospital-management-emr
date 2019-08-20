import { Component, Directive, ViewChild } from '@angular/core';
import { ReportingService } from "../../../reporting/shared/reporting-service";
import { RPT_BIL_PatientCreditSummaryModel } from './patient-credit-summary.model';
import { DLService } from "../../../shared/dl.service"
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import { CommonFunctions } from '../../../shared/common.functions';
import { GridEmitModel } from "../../../shared/danphe-grid/grid-emit.model";
import * as moment from 'moment/moment';

@Component({
  templateUrl: "./patient-credit-summary.html"
})
export class RPT_BIL_PatientCreditSummaryComponent {
  public TodayDate: string = null;
  public patientName: string = "";
  public patientCreditSummary: RPT_BIL_PatientCreditSummaryModel = new RPT_BIL_PatientCreditSummaryModel();
  patientCreditSummaryColumns: Array<any> = null;
  patientCreditSummaryData: Array<any> = new Array<any>();
  dlService: DLService = null;

  constructor(
    _dlService: DLService,
    public msgBoxServ: MessageboxService,
    public reportServ: ReportingService) {
    this.dlService = _dlService;
    this.TodayDate = moment().format('DD-MM-YYYY');;
    this.patientCreditSummary.fromDate = moment().format('YYYY-MM-DD');
    this.patientCreditSummary.toDate = moment().format('YYYY-MM-DD');
    this.Load();
  }

  gridExportOptions = {
    fileName: 'CreditSummary_' + moment().format('YYYY-MM-DD') + '.xls'
  };

  Load()
  //{
  //    this.dlService.Read("/BillingReports/PatientCreditBillSummary")
  //        .map(res => res)
  //        .subscribe(res => this.Success(res),
  //        res => this.Error(res));
  //}
  {
    this.dlService.Read("/BillingReports/PatientCreditBillSummary?FromDate="
      + this.patientCreditSummary.fromDate + "&ToDate=" + this.patientCreditSummary.toDate)
      .map(res => res)
      .subscribe(res => this.Success(res),
        res => this.Error(res));
  }
  Error(err) {
    this.msgBoxServ.showMessage("error", [err]);
  }
  Success(res) {
    if (res.Status == "OK" && res.Results.length > 0) {
      this.patientCreditSummaryColumns = this.reportServ.reportGridCols.PatientCreditSummaryColumns;
      this.patientCreditSummaryData = res.Results;
    }
    else if (res.Status == "OK" && res.Results.length == 0) {
      this.msgBoxServ.showMessage("notice-message", ['No credit record is available.'])
      this.patientCreditSummaryColumns = this.reportServ.reportGridCols.PatientCreditSummaryColumns;
      this.patientCreditSummaryData = res.Results;
    }
    else {
      this.msgBoxServ.showMessage("failed", [res.ErrorMessage]);
    }
  }

  //on click grid export button we are catching in component an event.. 
  //and in that event we are calling the server excel export....
  OnGridExport($event: GridEmitModel) {
    switch ($event.Action) {
      default:
        break;
    }
  }


  ErrorMsg(err) {
    this.msgBoxServ.showMessage("error", ["Sorry!!! Not able export the excel file."]);
    console.log(err.ErrorMessage);
  }
}