import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GameRulesDialogComponent } from './game-rules-dialog.component';

describe('GameRulesDialogComponent', () => {
  let component: GameRulesDialogComponent;
  let fixture: ComponentFixture<GameRulesDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GameRulesDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GameRulesDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
