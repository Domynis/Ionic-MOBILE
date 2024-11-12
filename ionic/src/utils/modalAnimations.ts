import { createAnimation } from '@ionic/react';

// export const enterAnimation = (baseEl: any) => {
//     const wrapperAnimation = createAnimation()
//         .addElement(baseEl.querySelector('.modal-wrapper'))
//         .fromTo('transform', 'translateY(100%)', 'translateY(0)')
//         .fromTo('opacity', '0', '1');  // fade in effect

//     return createAnimation()
//         .addElement(baseEl)
//         .easing('ease-out')
//         .duration(500)
//         .addAnimation(wrapperAnimation);
// };

// export const leaveAnimation = (baseEl: any) => {
//     const wrapperAnimation = createAnimation()
//         .addElement(baseEl.querySelector('.modal-wrapper'))
//         .fromTo('transform', 'translateY(0)', 'translateY(100%)')
//         .fromTo('opacity', '1', '0');  // fade out effect

//     return createAnimation()
//         .addElement(baseEl)
//         .easing('ease-in')
//         .duration(400)
//         .addAnimation(wrapperAnimation);
// };

export const enterAnimation = (baseEl: HTMLElement) => {
    const root = baseEl.shadowRoot!;

    const backdropAnimation = createAnimation()
        .addElement(root.querySelector('ion-backdrop')!)
        .fromTo('opacity', '0.01', 'var(--backdrop-opacity)');

    const wrapperAnimation = createAnimation()
        .addElement(root.querySelector('.modal-wrapper')!)
        .keyframes([
            { offset: 0, opacity: '0', transform: 'scale(0)' },
            { offset: 1, opacity: '0.99', transform: 'scale(1)' },
        ]);

    return createAnimation()
        .addElement(baseEl)
        .easing('ease-out')
        .duration(500)
        .addAnimation([backdropAnimation, wrapperAnimation]);
};

export const leaveAnimation = (baseEl: HTMLElement) => {
    return enterAnimation(baseEl).direction('reverse');
};