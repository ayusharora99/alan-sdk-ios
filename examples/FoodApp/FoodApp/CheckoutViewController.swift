//
//  CheckoutViewController.swift
//  FoodApp
//
//  Created by Sergey Yuryev on 02/10/2019.
//  Copyright © 2019 Alan. All rights reserved.
//
import UIKit
import Stripe

class CheckoutViewController: UIViewController, UITableViewDelegate, UITableViewDataSource {
    

    @IBOutlet weak var user_address_field: UITextField!
    @IBOutlet weak var user_date_field: UITextField!
    @IBOutlet weak var user_time_field: UITextField!
    
    lazy var cardTextField: STPPaymentCardTextField = {
        let cardTextField = STPPaymentCardTextField()
        return cardTextField
    }()
    lazy var payButton: UIButton = {
        let button = UIButton(type: .custom)
        button.layer.cornerRadius = 5
        button.backgroundColor = .systemBlue
        button.titleLabel?.font = UIFont.systemFont(ofSize: 22)
        button.setTitle("Pay", for: .normal)
        button.addTarget(self, action: #selector(pay), for: .touchUpInside)
        return button
    }()
    
    

    override func viewDidLoad() {
        super.viewDidLoad()
        view.backgroundColor = .white
        let stackView = UIStackView(arrangedSubviews: [cardTextField, payButton])
        stackView.axis = .vertical
        stackView.spacing = 20
        stackView.translatesAutoresizingMaskIntoConstraints = false
        view.addSubview(stackView)
        NSLayoutConstraint.activate([
            stackView.leftAnchor.constraint(equalToSystemSpacingAfter: view.leftAnchor, multiplier: 2),
            view.rightAnchor.constraint(equalToSystemSpacingAfter: stackView.rightAnchor, multiplier: 2),
            stackView.topAnchor.constraint(equalToSystemSpacingBelow: tableView.bottomAnchor, multiplier: 50),
        ])
    }

    @objc
    func pay() {
        print("pay!")
        let mainStoryBoard = UIStoryboard(name: "Main", bundle: Bundle.main)
        
        guard let checkoutConfirmationController =  mainStoryBoard.instantiateViewController(identifier: "CheckoutConfirmation") as? CheckoutConfirmation else{
            print("couldn't find check out confirmation screen :/")
            return
        }
        
        
      //present(checkoutConfirmationController, animated: true, completion: nil)
        
      navigationController?.pushViewController(checkoutConfirmationController, animated: true)
        
    }
    
    

    // MARK: - Outlets
    
    /// Checkout table
    @IBOutlet weak var tableView: UITableView!
    
    
    // MARK: - Vars
    
    
    // MARK: - View lifecycle
    
    // MARK: - UITableView
    
    func tableView(_ tableView: UITableView, numberOfRowsInSection section: Int) -> Int {
        return CheckoutManager.shared.getItems().count
    }
    
    func tableView(_ tableView: UITableView, cellForRowAt indexPath: IndexPath) -> UITableViewCell {
        let cell = tableView.dequeueReusableCell(withIdentifier: "checkoutCell", for: indexPath)
        
        let item = CheckoutManager.shared.getItems()[indexPath.row]
        let imageName = item.imageName
        let name = item.name
        let itemsCount = CheckoutManager.shared.itemCount(item)
        
        if let imageView = cell.viewWithTag(1) as? UIImageView {
            imageView.image = UIImage(named: imageName)
            imageView.contentMode = .scaleAspectFill
            imageView.clipsToBounds = true
        }
        if let textLabel = cell.viewWithTag(2) as? UILabel {
            textLabel.text = name
        }
        if let textLabel = cell.viewWithTag(3) as? UILabel {
            textLabel.text = "\(itemsCount)"
        }
        
        return cell
    }

}

