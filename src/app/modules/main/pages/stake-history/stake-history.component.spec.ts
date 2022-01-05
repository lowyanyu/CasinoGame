import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StakeHistoryComponent } from './stake-history.component';

describe('StakeHistoryComponent', () => {
  let component: StakeHistoryComponent;
  let fixture: ComponentFixture<StakeHistoryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StakeHistoryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StakeHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
