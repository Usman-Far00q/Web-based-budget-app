/************************************************************************ 
       MOODULE FOR BUDGET DATA
**************************************************************************/
var budgetController = (function (){
	
	var Expense = function(id,description,value){
		this.id = id;
		this.description = description;
		this.value = value;
	};

	var Income = function(id,description,value){
		this.id = id;
		this.description = description;
		this.value = value;
	};
	var calculateTotal = function(type){
			var sum = 0;
			data.allItems[type].forEach(function(current_el){
				sum = sum+current_el.value;
			});
			data.totals[type] = sum;
	};
	var data = {
		allItems:{
			exp:[],
			inc:[]
		},
		totals:{
			exp:0,
			inc:0
		},
		budget:0,
		percentage :-1
	};
	return{
		addItem:function(type,des,val){
			var newItem,ID;
			//create new ID
			if(data.allItems[type].length>0)
			{
				ID = data.allItems[type][data.allItems[type].length-1].id+1;
			}
			else{
				ID=0;
			}
			
			if(type ==='exp')
			{
				newItem = new Expense(ID,des,val);
			}
			else if(type ==='inc')
			{
				newItem = new Income(ID,des,val);
			}
			data.allItems[type].push(newItem);
			//return new element
			return newItem;
		},

		deleteItem:function(type,id){
			var ids, index;
			ids = data.allItems[type].map(function(current){
				return current.id;
			});
			index = ids.indexOf(id);
			if(index !==-1)
			{
				data.allItems[type].splice(index,1);
			}
		},
		calculateBudget:function(){
			//calc total ncome and expenses
			calculateTotal('exp');
    		calculateTotal('inc');
			//calc buget:income-expences
			data.budget = data.totals.inc - data.totals.exp;
			//calcuate percentage of income that we spent
			if(data.totals.inc>0)
			{
				data.percentage = Math.round((data.totals.exp/data.totals.inc)*100);
			}
			else{
				data.percentage = -1;
			}

		},
		getBudget:function(){
			return{
				budget:data.budget,
				totalincome:data.totals.inc,
				totalexpense:data.totals.exp,
				percentage:data.percentage
			};
		},
		testing:function(){
			console.log(data);
		}
	}
})();



/**************************************************************************
	MODULE FOR UI
****************************************************************************/
var UIController = (function(){
	var useful_namesin_ui = {           //not necessary but for future proofing
		plus_or_minus : '.selec',
		description :"#description",
		amount:"#amount"
	};

	return {
			getinput:function(){
							return{
									type_of_money : document.querySelector(useful_namesin_ui.plus_or_minus).value, //will be inc or exp
									description : document.querySelector(useful_namesin_ui.description).value,
									value : parseFloat(document.querySelector(useful_namesin_ui.amount).value),
								};
							},

			addListItem:function(obj,type){
				var htmll;
				var newhtmll;
				//create html string with placeholder text
				if(type === 'inc')
				{
					htmll = '<div class="in group" id=inc-%id%><div class="in_type"> %Project% </div><button class="btn cancel">cancel</button><div class="in_amount">+%amount%</div></div>';
					//replace the placeholder text with actual data
					newhtmll = htmll.replace('%Project%',obj.description );
					newhtmll = newhtmll.replace('%id%',obj.id);
					newhtmll = newhtmll.replace('%amount%',obj.value);
					//insert html into the DOM
					document.querySelector('.show_income').insertAdjacentHTML('beforeend', newhtmll);
				}
				else if(type === 'exp')
				{
					htmll = '<div class="expenc group" id=exp-%id%><div class="expenc_type"> %Project% </div><button class="btn cancel">cancel</button><div class="expenc_amount">-%amount%</div>';
					//replace the placeholder text with actual data
					newhtmll = htmll.replace('%Project%',obj.description );
					newhtmll = newhtmll.replace('%id%',obj.id);
					newhtmll = newhtmll.replace('%amount%', obj.value);
					//insert html into the DOM
					document.querySelector('.show_expense').insertAdjacentHTML('beforeend', newhtmll);
				}
			},				
			removeItem:function(elementId){
				var el = document.getElementById(elementId);
				el.parentNode.removeChild(el);
			},
			clearFields: function()
			{
				var list_to_array;
				list_to_array = Array.prototype.slice.call(document.querySelectorAll('#description'+',#amount'));
					list_to_array[0].value = '';
					list_to_array[1].value = '';

				list_to_array[0].focus();
			},
			displayBudget:function(obj){
				document.querySelector(".budget").textContent = obj.budget;
				document.querySelector(".income_amount").textContent ='+' + obj.totalincome;
				document.querySelector(".expenses_amount").textContent = '-' + obj.totalexpense;
				document.getElementById("percent_expense").textContent = obj.percentage+'%';
			},
			getuseful_namesin_ui: function()
											{
												return useful_namesin_ui;

											}
			};

})();



/**********************************************************************************
	MODULE FOR CONTROLLER (THE ONE THAT LINKS THE UI AND THE BUDGET DATA)
************************************************************************************/
var Controller = (function(budgetCtr,UICtrl){

    var setup_eventlisteners_and_useful_names = function(){
    	var useful_namesin_ui = UICtrl.getuseful_namesin_ui();
    document.querySelector('.button_check_mark').addEventListener('click' , ctrlAddItem);

	document.addEventListener('keypress',function(evnt){
		if(evnt.keyCode === 13 || event.which === 13){
			ctrlAddItem();
		}
	
		});
	document.addEventListener('click',ctrlDeleteItem);
    }
    var updateBudget = function(){
    	var budget;
    	//need to calculate the budget
    	budgetCtr.calculateBudget();
    	//return the budget
    	budget = budgetCtr.getBudget();
		//display the budget on the UI
		UICtrl.displayBudget(budget);
    };

	//get input data
	var ctrlAddItem = function(){
		var input = UICtrl.getinput();

		if(input.description !== '' && !isNaN(input.value) && input.value>0)
		{
			//add the item to the budget controller
			var newItem = budgetCtr.addItem(input.type_of_money,input.description,input.value);
			//add the new item to the UI
		 	UIController.addListItem(newItem,input.type_of_money);
		 	// clear the input fields
		 	UICtrl.clearFields();

		 	//calculate and update budget
		 	updateBudget();
		}
		else{
			alert('you must not leave any field empty or 0');
		}
	};

	var ctrlDeleteItem = function(event){
		var itemId;
		var type;
		var ID;
		var splitId;
		if(event.target.classList.contains('cancel')){
			itemId = event.target.parentNode.id;
			splitId = itemId.split('-');
			type = splitId[0];
			ID = splitId[1]; //this is going to be a string

			//delete the item form the data structure
			budgetCtr.deleteItem(type , parseInt(ID));
			//delete the item from the ui
			UICtrl.removeItem(itemId);
			//update and show the new budget
			updateBudget();
		}
						
	};
	return {
		init:function(){
			console.log('application has started');
			setup_eventlisteners_and_useful_names();
		}
	}
	
})(budgetController,UIController);

Controller.init();

