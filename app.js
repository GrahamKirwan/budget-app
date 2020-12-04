// BUDGET CONTROLLER
var budgetController = (function(){

      // Expense function constructor
      var Expense = function(id, description, value) {
          this.id = id,
          this.description = description,
          this.value = value;
          this.percentage = -1;
      };

      Expense.prototype.calcPercentage = function(totalIncome) {

        if(totalIncome > 0) {
            this.percentage = Math.round((this.value / totalIncome) * 100);
        } else {
            this.percentage = -1;
        }
      };

      Expense.prototype.getPercentage = function() {
          return this.percentage;
      }

      // Income function constructor 
      var Income = function(id, description, value) {
          this.id = id,
          this.description = description,
          this.value = value;
      };

      // Private function that will calculate the the total incomes and total expenses and save them in an array
      var calculateTotal = function(type) {
          var sum = 0;
          data.allItems[type].forEach(function(cur){
            sum = sum + cur.value
          });
          data.totals[type] = sum;
      };

      // Data structure to hold all expenses, incomes and budgets
      var data = {
          allItems: {
            exp: [],
            inc: []
          },
          totals: {
              exp: 0,
              inc: 0
          }, 
          budget : 0,
          percentage: -1
      };

      return {
          addItem: function(type, des, val) {
            var newItem, ID;

            // To calculate ID we find the ID of the last object in the array and add 1 to that ID
            if (data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            } else {
                ID = 0;
            }
            

            // Create new item based on 'inc' or 'exp' type
            if (type === 'exp') {
                newItem = new Expense(ID, des, val);
            } else if (type === 'inc') {
                newItem = new Income(ID, des, val);
            }
            
            // Push it into the data structure
            data.allItems[type].push(newItem);
            
            

            // Return the new element
            return newItem;
          },

          deleteItem: function(type, id) {
            var ids, index;

            ids = data.allItems[type].map(function(current) {
                return current.id;
            });
            

            index = ids.indexOf(id);
            

            if (index !== -1 ) {
                data.allItems[type].splice(index, 1);
                console.log("spliced");
            }
          },

          calculateBudget: function() {

            // Calculate total income and expenses
            calculateTotal('exp');
            calculateTotal('inc');

            // Calculate the budget: income - expenses
            data.budget = data.totals.inc - data.totals.exp;

            // Calculate the percentage of income that we spent (if there is income)
            if(data.totals.inc > 0 ) {
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            } else {
                data.percentage = -1;
            }
            
          },

          calculatepercentages: function() {

            data.allItems.exp.forEach(function(cur) {
                cur.calcPercentage(data.totals.inc);
            });

          },

          getPercentages: function() {
            var allPerc = data.allItems.exp.map(function(cur){
                return cur.getPercentage();
            });
            return allPerc;
          },

          // Return the budget in an object when called by the global controller
          getBudget: function() {
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            }
          },

          testing: function(){
              console.log(data);
          }
      };

})();


















// UI CONTROLLER
var uiController = (function(){

    var DOMstrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputButton: '.add__btn',
        incomeContainer: '.income__list',
        expenseContainer: '.expenses__list',
        budgetValue: '.budget__value',
        incomeValue: '.budget__income--value',
        expensesValue: '.budget__expenses--value',
        percentageValue: '.budget__expenses--percentage',
        container: '.container',
        expensesPercLabel: '.item__percentage',
        dateLabel: '.budget__title--month'
    };

    var formatNumber =  function(num, type) {
        var numSplit, int, dec;
         // + or - before number
         // exactly 2 decimal places
         // comma seperating the thousands
         num = Math.abs(num);
         num = num.toFixed(2); 
         
         numSplit = num.split('.');

         int = numSplit[0];
         dec = numSplit[1];
         if(int.length > 3) {
            int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, int.length);
         }
         int = int + '.' + dec;

         if(type === 'inc') {
             int = '+ ' + int;
         } else {
            int = '- ' + int;
         }

         return int;

    };

    return {

        getInput : function() {
            return {
                type: document.querySelector(DOMstrings.inputType).value, // Will be either inc or exp
                description: document.querySelector(DOMstrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
            }
        },

        addListItems: function(obj, type) {
            var html, newHtml, element;

            // Create HTML string with placeholder text
            if (type === 'inc') {
                element = DOMstrings.incomeContainer;

                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            } else if (type === 'exp') {
                element = DOMstrings.expenseContainer;

                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }
            
            // Replace the placeholder text with some actual data
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));

            // Insert the HTML into the DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);

        },

        clearFields: function() {
            var fields, fieldsArr;

            // Fields here will be a nodelist of the two input fields
            fields = document.querySelectorAll(DOMstrings.inputDescription + ', ' + DOMstrings.inputValue);

            // This will turn a nodelist into an array
            fieldsArr = Array.prototype.slice.call(fields);

            // Loop through the array selecting the two input fields and set their value to empty
            for(var i=0;i<fieldsArr.length;i++){
                fieldsArr[i].value = "";
            }

            // Puts the focus back on the description after its cleared
            fieldsArr[0].focus();
        },

        displayBudget: function(obj) {

            if(obj.budget > 0) {
                var type = "inc";
            } else {
                type = "exp";
            }

            document.querySelector(DOMstrings.budgetValue).textContent = formatNumber(obj.budget, type);
            document.querySelector(DOMstrings.incomeValue).textContent = formatNumber(obj.totalInc, "inc");
            document.querySelector(DOMstrings.expensesValue).textContent = formatNumber(obj.totalExp, "exp");
            if (obj.percentage > 0) {
                document.querySelector(DOMstrings.percentageValue).textContent = obj.percentage;
            } else {
                document.querySelector(DOMstrings.percentageValue).textContent = '---';
            }
            
        },

        deleteListItem: function(selectorID) {
            var el = document.getElementById(selectorID);
            el.parentNode.removeChild(el);
        },

        updatePercentages: function(percentagesArr) {

            // Return a node list of all the expenses fields in the dom
            var fields = document.querySelectorAll(DOMstrings.expensesPercLabel);

            // Create our own forEach function but for nodeLists instead of arrays
            var nodeListForEach = function(list, callback) {
                for (var i = 0; i < list.length; i++) {
                    callback(list[i], i);
                }
            };

            nodeListForEach(fields, function(current, index) {

                if(percentagesArr[index] > 0) {
                    current.textContent = percentagesArr[index] + '%';
                } else {
                    current.textContent = '---';
                }
                
            });


        },

        displayMonth: function() {
            var now, year, month, months;
            
            now = new Date();

            months = ['Janurary', 'Feburary', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            year = now.getFullYear();
            month = now.getMonth();
            document.querySelector(DOMstrings.dateLabel).textContent = months[month] + ' ' + year;

        },


        returnDomStrings : function() {
            return DOMstrings;
        }

    };


})();


















 
// GLOBAL APP CONTROLLER
var controller = (function(budgetCtrl, uiCtrl){

    var setupEventListeners = function() {
        var DOM = uiCtrl.returnDomStrings();

        // Listen for a click or enter keypress and then call the ctrlAddItem function
        document.querySelector(DOM.inputButton).addEventListener('click', ctrlAddItem);

        document.addEventListener('keypress', function(event) {
     
             if(event.keyCode === 13 || event.which === 13) {
                 ctrlAddItem();
             }
        });

        // Will listen for a click anywhere on the container, which will be the parent element of the delete button
        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);
    }

    var updateBudget = function() {

        // 1. Calculate the budget 
        budgetCtrl.calculateBudget();

        // 2. Return the budget
        var budget = budgetCtrl.getBudget();
        console.log(budget);

        // 3. Display the budget on the UI
        uiCtrl.displayBudget(budget);
    }

    var updatePercentages = function() {

        // 1. Calculate percentages
        budgetCtrl.calculatepercentages();

        // 2. Read percentages from the budget controller
        var percentages = budgetCtrl.getPercentages();

        // 3. Update the UI with the new percentages
        uiCtrl.updatePercentages(percentages);
        console.log(percentages);

    }

    // Control senter of the application, tells the other modlues what to do
    var ctrlAddItem = function() {
        var input, newItem;

        // 1. Get the field input data 
        input = uiCtrl.getInput();
        

        // Check that the input fields are valid and only continue with code if so 
        if (input.description !== "" && !isNaN(input.value) && input.value > 0) {

            // 2. Add the item to the budget controller
            newItem =  budgetCtrl.addItem(input.type, input.description, input.value);

            // 3. Add the item the UI
            uiCtrl.addListItems(newItem, input.type);

            // 4. Clear the fields
            uiCtrl.clearFields();

            // 5. Calculate and update the budget
            updateBudget();

            // 6. Calculate and update percentages 
            updatePercentages();
        }

       

    };

    var ctrlDeleteItem = function(event) {
        var itemID, splitID, type, ID;

        // When an object is clicked it will traverse the dom to its 4th parent and get the id
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

        // If there is an id split it up into type and id number
        if(itemID) {

            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);

            // 1. Delete item from the data structure
            budgetCtrl.deleteItem(type, ID);

            // 2. Delete the item from the UI
            uiCtrl.deleteListItem(itemID);

            // 3. Update and show the new budget
            updateBudget();

            // 4. Calculate and update percentages
            updatePercentages();

        }
    };

    return {
        init: function() {
            // Change the budget displays to zero when loaded
            uiCtrl.displayMonth();
            uiCtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1
            });
            setupEventListeners();
        }
    };

   
})(budgetController, uiController);


controller.init();









