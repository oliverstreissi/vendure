import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { OrderEditorComponent } from '@vendure/admin-ui/order';
import { notNullOrUndefined } from '@vendure/common/lib/shared-utils';
import { AddedLine, ModifyOrderData, OrderSnapshot } from '../../common/modify-order-types';

@Component({
    selector: 'vdr-order-modification-summary',
    templateUrl: './order-modification-summary.component.html',
    styleUrls: ['./order-modification-summary.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderModificationSummaryComponent {
    @Input() orderSnapshot: OrderSnapshot;
    @Input() modifyOrderInput: ModifyOrderData;
    @Input() addedLines: AddedLine[];
    @Input() shippingAddressForm: OrderEditorComponent['shippingAddressForm'];
    @Input() billingAddressForm: OrderEditorComponent['billingAddressForm'];
    @Input() couponCodesControl: FormControl<string[] | null>;

    get adjustedLines(): string[] {
        return (this.modifyOrderInput.adjustOrderLines || [])
            .map(l => {
                const line = this.orderSnapshot.lines.find(line => line.id === l.orderLineId);
                if (line) {
                    const delta = l.quantity - line.quantity;
                    const sign = delta === 0 ? '' : delta > 0 ? '+' : '-';
                    return delta
                        ? `${sign}${Math.abs(delta)} ${line.productVariant.name}`
                        : line.productVariant.name;
                }
            })
            .filter(notNullOrUndefined);
    }

    getModifiedFields(formGroup: FormGroup): string {
        if (!formGroup.dirty) {
            return '';
        }
        return Object.entries(formGroup.controls)
            .map(([key, control]) => {
                if (control.dirty) {
                    return key;
                }
            })
            .filter(notNullOrUndefined)
            .join(', ');
    }

    get couponCodeChanges(): string[] {
        const originalCodes = this.orderSnapshot.couponCodes || [];
        const newCodes = this.couponCodesControl.value || [];
        const addedCodes = newCodes.filter(c => !originalCodes.includes(c)).map(c => `+ ${c}`);
        const removedCodes = originalCodes.filter(c => !newCodes.includes(c)).map(c => `- ${c}`);
        return [...addedCodes, ...removedCodes];
    }
}
