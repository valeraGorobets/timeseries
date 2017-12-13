import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
	name: 'round'
})
export class RoundPipe implements PipeTransform {

	transform(value: number, digits: number): number {
		if(value){
			return +value.toFixed(digits);    
		}
	}

}
