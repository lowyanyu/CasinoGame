import { animate, state, style, transition, trigger } from '@angular/animations';
import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { Stake } from '@main/models/stake.model';
import { ApiService } from '@main/services/api.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-stake-history',
  templateUrl: './stake-history.component.html',
  styleUrls: ['./stake-history.component.scss'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', opacity: '0', minHeight: '0', visibility: 'hidden' })),
      state('expanded', style({ height: '*', opacity: '1', visibility: 'visible', marginBottom: '8px' })),
      transition('expanded <=> collapsed', animate('300ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ]
})
export class StakeHistoryComponent implements OnInit {

  stakeHist: Stake[];

  subscription: Subscription;

  constructor(
    private snackBar: MatSnackBar,
    public apiService: ApiService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.getStakeHistoryList();
  }

  ngOnDestroy(): void {
    this.snackBar.dismiss();
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  getStakeHistoryList(): void {
    this.subscription = this.apiService.getStakeHistoryList().subscribe({
      next: data => {
        this.stakeHist = data.result.map(s => {
          s = Object.assign({}, s, {status: 'collapsed'});
          return s;
        });
      },
      error: () => {
        const snackBarRef = this.snackBar.open('載入下注歷史清單失敗', '重新載入', {
          panelClass: ['my-snackbar']
        });
        snackBarRef.onAction().subscribe(() => {
          this.getStakeHistoryList();
        });
      }
    });
  }

  getStakeTotal(stake: Stake): number {
    return stake.player.map(p => (p.point ? p.point : 0)).reduce((a , b) => a + b, 0);
  }

  toggleStakeHist(stake: Stake): void {
    this.stakeHist = this.stakeHist.map(s => {
      if (s.stakeId === stake.stakeId) {
        s['status'] = stake['status'] === 'expanded' ? 'collapsed' : 'expanded';
      } else {
        s['status'] = 'collapsed';
      }
      return s;
    })
  }

  backToStake(): void {
    this.router.navigate(['main/stake']);
  }

  getWinCount(stake: Stake): string {
    const totalPoint = stake.player.map(item => (item.point ? item.point : 0)).reduce((a , b) => a + b, 0);
    const win = stake.winPoint - totalPoint;
    if (win === 0) {
      return '沒輸沒贏';
    } else if (win > 0) {
      return '+ ' + win;
    } else if (win < 0) {
      return '- ' + -win;
    }
  }

}
