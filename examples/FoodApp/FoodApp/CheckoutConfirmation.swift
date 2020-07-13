//
//  CheckoutConfirmation.swift
//  FoodApp
//
//  Created by Ayush Arora on 6/19/20.
//  Copyright © 2020 Alan. All rights reserved.
//

import Foundation


import UIKit
import Stripe

class CheckoutConfirmation: UIViewController{
    fileprivate func getRoot() -> UIViewController? {
        guard let window = UIApplication.shared.windows.first else {
            return nil
        }
        guard let root = window.rootViewController else {
            return nil
        }
        return root
    }

    @IBAction func back_to_menu(_ sender: Any) {
        DispatchQueue.main.async {
            UIView.animate(withDuration: 0.25, animations: {
                guard let container = self.getRoot() as? ContainerViewController else {
                           return
                }
                container.showMenu()
            })
        }
    }
    
    override func viewDidLoad() {
        super.viewDidLoad()
        print("Checkout Confirmation!")
    }
    
    override func didReceiveMemoryWarning() {
        super.didReceiveMemoryWarning()
    }
    
//    @IBAction func BackToMenu(_ sender: Any) {
//        let mainStoryBoard = UIStoryboard(name: "Main", bundle: Bundle.main)
//        
//        guard let menuViewController =  mainStoryBoard.instantiateViewController(identifier: "MenuViewController") as? MenuViewController else{
//            print("couldn't find check out confirmation screen :/")
//            return
//        }
//
//        navigationController?.pushViewController(menuViewController, animated: true)
//
//
//
//    }
    
    

}
