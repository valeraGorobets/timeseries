import { Injectable } from '@angular/core';

@Injectable()
export class KellyCriterionService {

	constructor() { }

	kellyBet(b: number, p: number) {
		return (p * (b + 1) - 1) / b;
	}

}
