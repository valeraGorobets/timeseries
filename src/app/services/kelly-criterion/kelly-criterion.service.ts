import { Injectable } from '@angular/core';

@Injectable()
export class KellyCriterionService {

	constructor() { }

	kellyBet(b, p) {
		return (p * (b + 1) - 1) / b;
	}

}
