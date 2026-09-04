import { TestBed } from '@angular/core/testing';
import { TranslatePipe } from './translate.pipe';
import { TranslationService } from './translation.service';

describe('TranslatePipe', () => {
  it('delegates to TranslationService.translate() with the given key and params', () => {
    const translateSpy = vi.fn().mockReturnValue('translated!');
    TestBed.configureTestingModule({
      providers: [{ provide: TranslationService, useValue: { translate: translateSpy } }],
    });

    const pipe = TestBed.runInInjectionContext(() => new TranslatePipe());
    const result = pipe.transform('common.cancel', { count: 2 });

    expect(result).toBe('translated!');
    expect(translateSpy).toHaveBeenCalledWith('common.cancel', { count: 2 });
  });
});
